# cdk-hello-world

## Step-by-step guide

### Bootstrap

Let's get started by creating a completely new CDK stack.

1. Create a new folder: `mkdir cdk-hello-world`
1. Jump into the folder: `cd cdk-hello-world`
1. Init a CDK project: `npx cdk init app --language typescript`
1. Update CDK to latest version: `npm i @aws-cdk/core@latest @aws-cdk/assert@latest aws-cdk@latest`
1. Go to the file `bin/cdk-hello-world.ts` and add a prefix or suffix to the stack, e.g.:

   ```typescript
   #!/usr/bin/env node
   import "source-map-support/register";
   import * as cdk from "@aws-cdk/core";
   import { CdkHelloWorldStack } from "../lib/cdk-hello-world-stack";

   const app = new cdk.App();
   new CdkHelloWorldStack(app, "CdkHelloWorldStackHenrik");
   ```

1. Deploy stack: `npx cdk deploy`

Questions:

- Why did we add a prefix or suffix to the stack?
- What did we actually deploy?

### The first lambda function

Cool, we have a CDK stack now. Next step is our first Lambda function:

1. Create a new `src` folder: `mkdir src`
1. Create a new file: `touch src/putNote.ts`
1. Go to the file and add the following code:
   ```typescript
   export const handler = async () => {
     console.log("Hello World :)");
   };
   ```
1. Before we can describe the infrastructure, we need a new NPM package: `npm i @aws-cdk/aws-lambda-nodejs esbuild@0`
1. Next, update the file `lib/cdk-hello-world-stack.ts`:

   ```typescript
   import * as cdk from "@aws-cdk/core";
   import * as lambda from "@aws-cdk/aws-lambda-nodejs";

   export class CdkHelloWorldStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);

       new lambda.NodejsFunction(this, "PutNote", {
         entry: "src/putNote.ts",
         handler: "handler",
       });
     }
   }
   ```

1. Deploy the latest changes: `npx cdk deploy`

Questions:

- What resources did we create and why?
- How can you execute the Lambda function?
- How can you see the log output from the Lambda function?

### API Gateway

In this section we want to create a simple HTTP API to invoke the Lambda function:

1. Install the NPM package for API Gateway: `npm i @aws-cdk/aws-apigatewayv2 @aws-cdk/aws-apigatewayv2-integrations`
1. Update `lib/cdk-hello-world-stack.ts`:

   ```typescript
   import * as cdk from "@aws-cdk/core";
   import * as lambda from "@aws-cdk/aws-lambda-nodejs";
   import * as apigateway from "@aws-cdk/aws-apigatewayv2";
   import * as apigatewayIntegrations from "@aws-cdk/aws-apigatewayv2-integrations";

   export class CdkHelloWorldStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);

       const putNote = new lambda.NodejsFunction(this, "PutNote", {
         entry: "src/putNote.ts",
         handler: "handler",
       });

       const putNoteIntegration = new apigatewayIntegrations.LambdaProxyIntegration(
         {
           handler: putNote,
         }
       );

       const httpApi = new apigateway.HttpApi(this, "HttpApi");

       httpApi.addRoutes({
         path: "/notes",
         methods: [apigateway.HttpMethod.POST],
         integration: putNoteIntegration,
       });

       new cdk.CfnOutput(this, "URL", { value: httpApi.apiEndpoint });
     }
   }
   ```

1. Update the Lambda function, so `src/putNote.ts`:

   ```typescript
   export const handler = async () => {
     console.log("Hello World :)");

     return {
       statusCode: 200,
       body: JSON.stringify({ hello: "world" }),
     };
   };
   ```

1. Deploy: `npx cdk deploy`
1. Copy the endpoint URL from the output of the deployment and run the following request: `curl -X POST https://XXXXX.execute-api.eu-central-1.amazonaws.com/notes`

Questions:

- What is a CloudFormation output and where do I find it?
- How does the integration between API Gateway and Lambda work?
- What happens if I try to access routes I didn't configure?

### DynamoDB

We have an API and a lambda function. Pretty cool, now let's create a database and persist something:

1. As always, new dependencies: `npm i @aws-cdk/aws-dynamodb`
1. Plus more dependencies for our local setup: `npm i --save-dev aws-sdk @types/aws-lambda`
1. Extend our stack:

   ```typescript
   import * as cdk from "@aws-cdk/core";
   import * as lambda from "@aws-cdk/aws-lambda-nodejs";
   import * as apigateway from "@aws-cdk/aws-apigatewayv2";
   import * as apigatewayIntegrations from "@aws-cdk/aws-apigatewayv2-integrations";
   import * as dynamodb from "@aws-cdk/aws-dynamodb";

   export class CdkHelloWorldStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);

       const notesTable = new dynamodb.Table(this, "NotesTable", {
         partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
       });

       const putNote = new lambda.NodejsFunction(this, "PutNote", {
         entry: "src/putNote.ts",
         handler: "handler",
         environment: {
           TABLE_NAME: notesTable.tableName,
         },
       });

       notesTable.grantReadWriteData(putNote);

       const putNoteIntegration = new apigatewayIntegrations.LambdaProxyIntegration(
         {
           handler: putNote,
         }
       );

       const httpApi = new apigateway.HttpApi(this, "HttpApi");

       httpApi.addRoutes({
         path: "/notes",
         methods: [apigateway.HttpMethod.POST],
         integration: putNoteIntegration,
       });

       new cdk.CfnOutput(this, "URL", { value: httpApi.apiEndpoint });
     }
   }
   ```

1. Update the lambda function:

   ```typescript
   import * as AWS from "aws-sdk";
   import { APIGatewayProxyEvent } from "aws-lambda";

   const DB = new AWS.DynamoDB();

   export const handler = async (event: APIGatewayProxyEvent) => {
     const body = JSON.parse(event.body || "{}");

     if (!body.title || !body.content) {
       return {
         statusCode: 400,
       };
     }

     await DB.putItem({
       Item: {
         id: {
           S: new Date().toISOString(),
         },
         title: {
           S: body.title,
         },
         content: {
           S: body.content,
         },
       },
       TableName: process.env.TABLE_NAME!,
     }).promise();

     return {
       statusCode: 201,
     };
   };
   ```

1. Run with your endpoint url: `curl -X POST https://XXXXXX.execute-api.eu-central-1.amazonaws.com/notes --data '{ "title": "Hello World", "content": "abc" }' -H 'Content-Type: application/json' -i`
1. Ideally, the first item should have been stored in the database.

Questions:

- Where can I find the environment variables of the Lambda function in the AWS console?
- What does the line `notesTable.grantReadWriteData(putNote)` do?
- Why do we just define the partition key for the table, but not the whole schema with the fields `title` and `content`?
