export type DeploymentConfig = {
  HOSTED_ZONE?: string;
  API_DOMAIN?: string;
  VPC_ID?: string;
  SUBNET_ID_1?: string;
  SUBNET_ID_2?: string;
  SECURITY_GROUP_ID?: string;
  WAF_WEB_ACL_ID?: string;
  COGNITO_USER_POOL_ID: string;
  COGNITO_CLIENT_ID: string;
};
