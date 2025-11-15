export type DeploymentConfig = {
  HOSTED_ZONE?: string;
  API_DOMAIN?: string;
  VPC_ID?: string;
  SUBNET_ID_1?: string;
  SUBNET_ID_2?: string;
  SECURITY_GROUP_ID?: string;
  WAF_WEB_ACL_ID?: string;
  SSM: {
    COGNITO_USER_POOL_ID_: string;
    COGNITO_CLIENT_ID: string;
    CLOUDFRONT_DOMAIN: string;
    CLOUDFRONT_SIGNING_KEY_ID: string;
    CLOUDFRONT_SIGNING_PRIVATE_KEY: string;
    VIDEO_BUCKET_NAME: string;
    SERVICE_ROLE_ARN: string;
  };
};
