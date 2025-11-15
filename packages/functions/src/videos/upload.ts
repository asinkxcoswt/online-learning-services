import { JSONSchemaType } from 'ajv';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { noAuth } from 'src/common/auth/noAuth';
import { middleware } from 'src/common/middleware';
import { getUploadUrl } from '@online-learning/core/files/getUploadUrl';
import { createVideoItem, CreateVideoItemInput } from '@online-learning/core/videos/createVideoItem';

type Request = CreateVideoItemInput;

async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const request = event.body as unknown as Request;

  const claims = (event.requestContext?.authorizer as any)?.jwt?.claims ?? {};
  const userSub = claims.sub; // Cognito userpool sub

  if (!userSub || request.userId !== userSub) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Forbidden' })
    };
  }

  const videoMetadata = await createVideoItem({
    ...request
  });
  const presignUploadUrl = await getUploadUrl({
    s3Key: videoMetadata.s3Key,
    contentType: videoMetadata.contentType
  });

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: JSON.stringify({
      ...videoMetadata,
      presignUploadUrl
    })
  };
}

const schema: JSONSchemaType<APIGatewayProxyEvent | { body: Request }> = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 100 },
        userId: { type: 'string', minLength: 1, maxLength: 100 },
        contentType: { type: 'string', minLength: 1, maxLength: 100 }
      },
      required: ['title', 'userId', 'contentType'],
      additionalProperties: false
    }
  },
  required: ['body']
};

const handler = middleware(main, schema, {
  auth: noAuth
});
export { handler };
