import type { AWS } from '@serverless/typescript';

import createAuction from '@functions/createAuction';
import getAuctions from '@functions/getAuctions';
import getAuction from '@functions/getAuction';
import placeBid from '@functions/placeBid';

const serverlessConfiguration: AWS = {
  service: 'sls-auction',
  frameworkVersion: '2',
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    memorySize: 256,
    stage: '${opt:stage, "dev"}',
    region: 'eu-west-1',
    iamRoleStatements: [{
      Effect: 'Allow',
      Action: ['dynamodb:PutItem', 'dynamodb:Scan', 'dynamodb:GetItem', 'dynamodb:UpdateItem'],
      Resource: '${self:custom.AuctionsTable.arn}',
    }],
    environment: {
      AUCTIONS_TABLE_NAME: '${self:custom.AuctionsTable.name}',
    },
  },
  resources: {
    Resources: {
      AuctionsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'AuctionsTable-${sls:stage}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S'
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH'
          }],
        }
      }
    }
  },
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    AuctionsTable: {
      name: { Ref: 'AuctionsTable' },
      arn: { 'Fn::GetAtt': ['AuctionsTable', 'Arn'] },
    },
  },
  functions: { createAuction, getAuctions, getAuction, placeBid },
};

module.exports = serverlessConfiguration;
