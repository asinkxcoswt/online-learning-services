import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { VideoItem } from './model'; // your interface/type definition
import { ERR } from '../error/error-utils';
import { Table } from 'sst/node/table';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export type GetVideoItemInput = {
  videoId: string;
};

export async function getVideoItem(input: GetVideoItemInput): Promise<VideoItem> {
  const tableName = Table['VideosTable'].tableName;

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: input.videoId }
      })
    );

    if (!result.Item) {
      throw ERR.notFound('Video not found');
    }

    // DynamoDBDocumentClient automatically unmarshals types for you.
    const item = result.Item as VideoItem;
    console.log(`✅ Found video:`, item);
    return item;
  } catch (err) {
    console.error('❌ Error fetching video:', err);
    throw ERR.unknown('Failed to get video item');
  }
}
