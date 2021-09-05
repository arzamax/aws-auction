import { handlerPath } from '@libs/handlerResolver';

export { getAuctionById } from './handler';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/auctions/{id}',
        authorizer: '${self:custom.authorizer}',
      },
    }
  ]
}