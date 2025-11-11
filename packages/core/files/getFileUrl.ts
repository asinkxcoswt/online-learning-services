import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Bucket } from 'sst/node/bucket';

const s3 = new S3Client({});

export async function getFileUrl(s3Key: string) {
  const bucketName = Bucket['video-bucket'].bucketName;
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key
    }),
    {
      // 1 day
      expiresIn: 3600 * 24
    }
  );
  return {
    url
  };
}
