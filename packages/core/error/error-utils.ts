import { createError } from '@middy/util';
function error(statusCode: number, message: string) {
  return createError(statusCode, message, {
    expose: true
  });
}

function notFound(message: string) {
  return createError(400, message, {
    expose: true
  });
}

function invalidInput(message: string) {
  return createError(400, message, {
    expose: true
  });
}

function invalidAuth(message: string) {
  return createError(401, message, {
    expose: true
  });
}

function refuse(message: string) {
  return createError(403, message, {
    expose: true
  });
}

function invalidState(message: string) {
  return createError(500, message, {
    expose: true
  });
}

function externalError(message: string) {
  return createError(500, message, {
    expose: true
  });
}

function unknown(message: string) {
  return createError(500, message, {
    expose: false
  });
}

const NOT_IMPLEMENTED = createError(500, 'Not Implemented', {
  expose: true
});

const UNAUTHORIZED = createError(401, 'Unauthorized', {
  expose: true
});

export const ERR = {
  error,
  notFound,
  invalidInput,
  invalidAuth,
  invalidState,
  refuse,
  externalError,
  unknown,
  NOT_IMPLEMENTED,
  UNAUTHORIZED
};

export function requireParam<T>(value: T | undefined | null, errorDesc: string): T {
  if (value === undefined || value === null) {
    throw invalidInput(errorDesc);
  }

  return value;
}

export function requireAuthParam<T>(value: T | undefined | null, errorDesc: string): T {
  if (value === undefined || value === null) {
    throw invalidAuth(errorDesc);
  }

  return value;
}
