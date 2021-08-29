import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const getEndedAuctions = async () => {
  const result = await dynamoDB.query({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status AND endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': (new Date()).toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    }
  }).promise();

  return result.Items;
}