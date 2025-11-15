import { Api, StackContext, Table, Bucket, Cognito } from 'sst/constructs';
import { resolveStackConfig } from './configurations';
import { RemovalPolicy } from 'aws-cdk-lib/core';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';

export function MainStack({ stack }: StackContext) {
  const config = resolveStackConfig(stack);

  const userPoolId = ssm.StringParameter.fromStringParameterName(stack, 'ImportedUserPoolIdParam', config.SSM.COGNITO_USER_POOL_ID_).stringValue;
  const userPoolClientId = ssm.StringParameter.fromStringParameterName(stack, 'ImportedUserPoolClientIdParam', config.SSM.COGNITO_CLIENT_ID).stringValue;

  const cloudfrontDomain = ssm.StringParameter.fromStringParameterName(stack, 'ImportedCloudfrontDomainParam', config.SSM.CLOUDFRONT_DOMAIN).stringValue;
  const cloudfrontSigningKeyPairId = ssm.StringParameter.fromStringParameterName(stack, 'ImportedCloudfrontSingningKeyPairIdParam', config.SSM.CLOUDFRONT_SIGNING_KEY_ID).stringValue;
  const videoBucketName = ssm.StringParameter.fromStringParameterName(stack, 'ImportedVideoBucketNameParam', config.SSM.VIDEO_BUCKET_NAME).stringValue;

  const serviceRoleArn = ssm.StringParameter.fromStringParameterName(stack, 'ImportedIamServiceRoleArnParam', config.SSM.SERVICE_ROLE_ARN).stringValue;

  const videoTable = new Table(stack, 'VideosTable', {
    fields: {
      id: 'string',
      userId: 'string',
      createdAt: 'string',
      title: 'string',
      s3Key: 'string',
      contentType: 'string',
      captionFileKey: 'string'
    },
    primaryIndex: { partitionKey: 'id' },

    // optional: global secondary index to query videos by userId (most recent first)
    globalIndexes: {
      byUser: { partitionKey: 'userId', sortKey: 'createdAt' }
    },

    cdk: {
      table: {
        billingMode: BillingMode.PAY_PER_REQUEST, // override to use PAY_PER_REQUEST
        removalPolicy: RemovalPolicy.DESTROY // change to RETAIN for prod
      }
    }
  });

  const videoBucket = new Bucket(stack, `video-bucket`, {
    cdk: {
      bucket: {
        objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED,
        blockPublicAccess: {
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true
        }
      }
    }
  });

  const api = new Api(stack, 'api', {
    accessLog: {
      retention: 'one_week',
      format: '$context.identity.sourceIp,$context.requestTime,$context.httpMethod,$context.routeKey,$context.protocol,$context.status,$context.responseLength,$context.requestId'
    },
    cors: {
      allowMethods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowOrigins: ['*']
    },
    authorizers: {
      jwt: {
        type: 'user_pool',
        userPool: {
          id: userPoolId,
          clientIds: [userPoolClientId]
        }
      }
    },
    defaults: {
      authorizer: 'jwt',
      function: {
        timeout: '30 seconds',
        copyFiles: [{ from: 'data', to: 'data' }],
        bind: [videoTable, videoBucket],
        environment: {
          DEBUG: 'axios*',
          CF_DISTRIBUTION_DOMAIN: cloudfrontDomain,
          CF_SIGNING_KEY_PARAM_NAME: config.SSM.CLOUDFRONT_SIGNING_PRIVATE_KEY,
          CF_KEY_PAIR_ID: cloudfrontSigningKeyPairId,
          VIDEO_BUCKET_NAME: videoBucketName,
          SERVICE_ROLE_ARN: serviceRoleArn
        },
        vpc: config.vpc as any,
        vpcSubnets: config.vpcSubnets as any,
        securityGroups: config.securityGroups as any
      }
    },
    routes: {
      'POST /upload': 'packages/functions/src/videos/upload.handler',
      'GET /videos/{id}': 'packages/functions/src/videos/get.handler'
    },
    customDomain: config.customDomains?.functions
  });

  api.attachPermissions([
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [serviceRoleArn]
    }),
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: [`arn:aws:ssm:${stack.region}:${stack.account}:parameter/online-learning/cf-signing-key/private`]
    })
  ]);

  stack.addOutputs({
    apiEndpoint: api.url
  });

  return {
    API_URL: api.url
  };
}
