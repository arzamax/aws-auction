import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyEventNormalizer from '@middy/http-event-normalizer';
import middyErrorHandler from '@middy/http-error-handler';

export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser()).use(middyEventNormalizer()).use(middyErrorHandler())
}
