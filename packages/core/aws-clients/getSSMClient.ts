import { S3Client } from '@aws-sdk/client-s3';
import { SSMClient } from '@aws-sdk/client-ssm';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

const ROLE_ARN = process.env.SERVICE_ROLE_ARN!; // target role you created in Terraform
const REGION = process.env.AWS_REGION || 'ap-southeast-1';

let ssmClient: SSMClient | null = null;

export function getSSMClient(): SSMClient {
  if (!ssmClient) {
    ssmClient = new SSMClient({
      region: REGION,
      credentials: fromTemporaryCredentials({
        params: {
          RoleArn: ROLE_ARN,
          RoleSessionName: 'video-service-session'
        }
      })
    });
  }

  return ssmClient;
}
