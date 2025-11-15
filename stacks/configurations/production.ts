import { DeploymentConfig } from './types';

export const ProductionConfig: DeploymentConfig = {
  HOSTED_ZONE: undefined,
  API_DOMAIN: undefined,
  VPC_ID: 'vpc-0f7f1a69e169fd40b',
  SUBNET_ID_1: 'subnet-00701171c2f55018d',
  SUBNET_ID_2: 'subnet-07d5064bf54c6e50b',
  SECURITY_GROUP_ID: 'sg-08592c783ccc158a2',
  SSM: {
    COGNITO_USER_POOL_ID_: '/online-learning/cognito/user_pool_id',
    COGNITO_CLIENT_ID: '/online-learning/cognito/user_pool_client_id',
    CLOUDFRONT_DOMAIN: '/online-learning/cloudfront/domain',
    CLOUDFRONT_SIGNING_KEY_ID: '/online-learning/cloudfront/signing-key-id',
    CLOUDFRONT_SIGNING_PRIVATE_KEY: '/online-learning/cf-signing-key/private',
    VIDEO_BUCKET_NAME: '/online-learning/s3/video-bucket-name',
    SERVICE_ROLE_ARN: '/online-learning/iam/video-service-role-arn'
  }
};
