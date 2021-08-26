import 'source-map-support/register';
import AWS from 'aws-sdk';
import createHttpError from 'http-errors';

import { middyfy } from '@libs/lambda';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuctions = async () => {
  try {
    const result = await dynamoDB.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(result.Items),
    }
  } catch (e) {
    throw new createHttpError.InternalServerError(e);
  }
}

export const main = middyfy(getAuctions);