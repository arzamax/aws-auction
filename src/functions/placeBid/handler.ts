import 'source-map-support/register';
import AWS from 'aws-sdk';
import createHttpError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { getAuctionById } from '@functions/getAuction';

import schema from './schema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const placeBid: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID "${id} is not found"`);
  }

  if (email === auction.seller) {
    throw new createHttpError.Forbidden('You cannot bid on your own auction');
  }

  if (email === auction.highestBid.bidder) {
    throw new createHttpError.Forbidden('You are already the highest bidder');
  }

  if (auction.status !== 'OPEN') {
    throw new createHttpError.Forbidden('You cannot bid on closed auctions!');
  }

  if (amount <= auction.highestBid.amount) {
    throw new createHttpError.BadRequest('Amount is too low');
  }

  try {
    const result = await dynamoDB.update({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':bidder': email,
      },
      ReturnValues: 'ALL_NEW',
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(result.Attributes),
    }
  } catch (e) {
    throw new createHttpError.InternalServerError(e);
  }
}

export const main = middyfy(placeBid);
