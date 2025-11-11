import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export type MiddyRequest = middy.Request<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context, {}>;
export type Authorizer = (request: MiddyRequest) => Promise<void>;
