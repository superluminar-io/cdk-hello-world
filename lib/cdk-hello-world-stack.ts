import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class CdkHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const notesTable = new dynamodb.Table(this, 'NotesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    })

    const putNote = new lambda.NodejsFunction(this, 'PutNote', {
      entry: 'src/putNote.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: notesTable.tableName
      }
    });

    notesTable.grantReadWriteData(putNote);

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
