import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Bucket } from 'sst/node/bucket';
import { v4 } from 'uuid';

const s3 = new S3Client({});

export async function getUploadUrl(file: { s3Key: string; contentType: string }) {
  const bucketName = Bucket['video-bucket'].bucketName;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucketName,
      Key: file.s3Key,
      ContentType: file.contentType
    }),
    {
      expiresIn: 3600 * 24 // 1 day
    }
  );
  return {
    url,
    s3Key: file.s3Key
  };
}
