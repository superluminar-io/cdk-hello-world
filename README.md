# cdk-hello-world

## Step-by-step guide

## Bootstrap

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

## The first lambda function

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
