import 'source-map-support/register';
import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import createHttpError from 'http-errors';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createAuction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { title } = event.body;
  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: (new Date()).toISOString(),
    highestBid: {
      amount: 0,
    }
  };

  try {
    await dynamoDB.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch (e) {
    throw new createHttpError.InternalServerError(e);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  }
}

export const main = middyfy(createAuction);
