export type VideoItem = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  s3Key: string;
  captionFileKey?: string;
  contentType: string;
};
