import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { VideoItem } from './model';
import { v4 as uuidv4 } from 'uuid';
import { Table } from 'sst/node/table';

export type CreateVideoItemInput = {
  title: string;
  userId: string;
  contentType: string;
};

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export async function createVideoItem(input: CreateVideoItemInput): Promise<VideoItem> {
  const tableName = Table['VideosTable'].tableName;

  const id = `${input.userId}-${uuidv4()}`;

  const item: VideoItem = {
    id,
    userId: input.userId,
    title: input.title,
    createdAt: new Date().toISOString(),
    s3Key: `videos/${input.userId}/${id}.mp4`,
    contentType: input.contentType
  };

  await docClient.send(
    new PutCommand({
      TableName: tableName,
      Item: item
    })
  );

  console.log(`✅ Saved video item:`, item);
  return item;
}
