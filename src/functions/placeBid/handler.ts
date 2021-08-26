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

  const auction = await getAuctionById(id);

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID "${id} is not found"`);
  }

  if (amount <= auction.highestBid.amount) {
    throw new createHttpError.BadRequest('Amount is too low');
  }

  try {
    const result = await dynamoDB.update({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set highestBid.amount = :amount',
      ExpressionAttributeValues: {
        ':amount': amount,
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
