import { S3Client } from '@aws-sdk/client-s3';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

const ROLE_ARN = process.env.SERVICE_ROLE_ARN!; // target role you created in Terraform
const REGION = process.env.AWS_REGION || 'ap-southeast-1';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: REGION,
      credentials: fromTemporaryCredentials({
        params: {
          RoleArn: ROLE_ARN,
          RoleSessionName: 'video-service-session'
        }
      })
    });
  }

  return s3Client;
}
