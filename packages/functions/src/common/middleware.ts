import { ERR } from '@online-learning/core/error/error-utils';
import middy from '@middy/core';
import errorLogger from '@middy/error-logger';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import inputOutputLogger from '@middy/input-output-logger';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { Authorizer } from './auth';
import { ErrorMapper } from './error';

export type MiddlewareOptions<T = unknown> = {
  auth: Authorizer;
  mapError?: ErrorMapper<T>;
};

export function middleware(handler: APIGatewayProxyHandler, requestSchema: object, { auth, mapError }: MiddlewareOptions): APIGatewayProxyHandler {
  return middy(handler)
    .use(cors())
    .use(
      inputOutputLogger({
        omitPaths: [
          'event.headers.api-key',
          'event.body.password',
          'event.body.token',
          'event.body.data.cardNumber',
          'event.body.data.cvv',
          'event.body.data.expiryMonth',
          'event.body.data.expiryYear',
          'event.body.data.cardHolderFirstName',
          'event.body.data.cardHolderLastName',
          'event.body.data.cardCountry'
        ],
        mask: '***redacted***'
      })
    )
    .use(errorLogger())

    .before((request) => {
      if (request.event.body !== undefined) {
        jsonBodyParser({
          disableContentTypeError: true
        }).before?.(request);
      }
    })
    .before(auth)
    .use(
      validator({
        eventSchema: transpileSchema(requestSchema, {
          strict: false
        })
      })
    )
    .use(httpErrorHandler())
    .onError((request) => {
      const cause = request.error?.cause as any;
      if (cause?.package === '@middy/validator') {
        console.log('In custom error handler');
        request.error = ERR.invalidInput(JSON.stringify(cause.data, null, 2));
      }
    })
    .onError((request) => {
      if (mapError) {
        const _err = request.error as any;
        const [responseBody, statusCode] = mapError(_err, _err?.statusCode);
        request.error = ERR.error(statusCode, JSON.stringify(responseBody, null, 2));
      }
    });
}
