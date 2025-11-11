import { getFileUrl } from '@online-learning/core/files/getFileUrl';
import { getVideoItem } from '@online-learning/core/videos/getVideoItem';
import { JSONSchemaType } from 'ajv';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { noAuth } from 'src/common/auth/noAuth';
import { middleware } from 'src/common/middleware';

async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const videoId = event.pathParameters?.['id'];

  const videoMetadata = await getVideoItem({
    videoId: videoId!
  });

  const presignUrl = await getFileUrl(videoMetadata.s3Key);

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
