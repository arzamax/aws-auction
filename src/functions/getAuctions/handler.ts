import 'source-map-support/register';
import AWS from 'aws-sdk';
import createHttpError from 'http-errors';
import { APIGatewayProxyEvent } from 'aws-lambda';
import validator from '@middy/validator';

import { middyfy } from '@libs/lambda';
import schema from './schema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getAuctions = async (event: APIGatewayProxyEvent) => {
  const { status } = event.queryStringParameters;

  try {
    const result = await dynamoDB.query({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeValues: {
        ':status': status,
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      }
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify(result.Items),
    }
  } catch (e) {
    throw new createHttpError.InternalServerError(e);
  }
}

export const main = middyfy(getAuctions).use(validator({ inputSchema: schema, ajvOptions: { useDefaults: true, strict: false } }));