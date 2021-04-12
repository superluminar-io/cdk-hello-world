import * as AWS from "aws-sdk";
import { APIGatewayProxyEvent } from "aws-lambda";

const DB = new AWS.DynamoDB()

export const handler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body || '{}');

  if (!body.title || !body.content) {
    return {
      statusCode: 400
    };
  }

  await DB.putItem({
    Item: {
      id: {
        S: new Date().toISOString()
      },
      title: {
        S: body.title
      },
      content: {
        S: body.content
      },
    },
    TableName: process.env.TABLE_NAME!
  }).promise();

  return {
    statusCode: 201,
  }
}
