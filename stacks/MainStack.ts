import { Api, StackContext, Table, Bucket } from 'sst/constructs';
import { resolveStackConfig } from './configurations';
import { RemovalPolicy } from 'aws-cdk-lib/core';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { ObjectOwnership } from 'aws-cdk-lib/aws-s3';

export function MainStack({ stack }: StackContext) {
  const config = resolveStackConfig(stack);

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
    defaults: {
      function: {
        timeout: '30 seconds',
        copyFiles: [{ from: 'data', to: 'data' }],
        bind: [videoTable, videoBucket],
        environment: {
          DEBUG: 'axios*',
          VIDEO_TABLE_NAME: videoTable.tableName
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

  stack.addOutputs({
    apiEndpoint: api.url
  });

  return {
    API_URL: api.url
  };
}
