import { getFileUrl } from '@online-learning/core/files/getFileUrl';
import { getCloudFrontSignedUrl } from '@online-learning/core/files/getCloudFrontSignedUrl';
import { getVideoItem } from '@online-learning/core/videos/getVideoItem';
import { JSONSchemaType } from 'ajv';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { noAuth } from 'src/common/auth/noAuth';
import { middleware } from 'src/common/middleware';

async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const claims = (event.requestContext?.authorizer as any)?.jwt?.claims ?? {};
  const userSub = claims.sub; // Cognito userpool sub

  const videoId = event.pathParameters?.['id'];

  const videoMetadata = await getVideoItem({
    videoId: videoId!
  });

  if (!userSub || videoMetadata.userId !== userSub) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Forbidden' })
    };
  }

  // const presignUrl = await getFileUrl(videoMetadata.s3Key);
  const presignUrl = await getCloudFrontSignedUrl(videoMetadata.s3Key);

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: JSON.stringify({
      ...videoMetadata,
      presignUrl
    })
  };
}

const schema: JSONSchemaType<APIGatewayProxyEvent | {}> = {
  type: 'object',
  properties: {},
  required: []
};

const handler = middleware(main, schema, {
  auth: noAuth
});
export { handler };
