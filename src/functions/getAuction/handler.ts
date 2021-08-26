import 'source-map-support/register';
import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { middyfy } from '@libs/lambda';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const getAuctionById = async (id: string) => {
  let auction;

  try {
    const result = await dynamoDB.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }
    }).promise();
    auction = result.Item;
  } catch (e) {
    throw new createHttpError.InternalServerError(e);
  }

  if (!auction) {
    throw new createHttpError.NotFound(`Auction with ID "${id} is not found"`);
  }

  return auction;
}

const getAuction = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  }
}

export const main = middyfy(getAuction);