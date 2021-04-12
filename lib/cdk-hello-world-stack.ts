import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';

export class CdkHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const putNote = new lambda.NodejsFunction(this, 'PutNote', {
      entry: 'src/putNote.ts',
      handler: 'handler'
    });

    const putNoteIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: putNote,
    });
    
    const httpApi = new apigateway.HttpApi(this, 'HttpApi');
    
    httpApi.addRoutes({
      path: '/notes',
      methods: [ apigateway.HttpMethod.POST ],
      integration: putNoteIntegration,
    });

    new cdk.CfnOutput(this, 'URL', { value: httpApi.apiEndpoint });
  }
}
