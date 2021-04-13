import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as codedeploy from '@aws-cdk/aws-codedeploy';

export interface CdkHelloWorldProps extends cdk.StackProps {
  environmentName: 'production' | 'development'
}

export class CdkHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CdkHelloWorldProps) {
    super(scope, id, props);

    const notesTable = new dynamodb.Table(this, 'NotesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: props.environmentName === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY
    })

    const putNote = new lambdaNode.NodejsFunction(this, 'PutNote', {
      entry: 'src/putNote.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: notesTable.tableName
      }
    });

    const versionAlias = new lambda.Alias(this, 'alias', {
      aliasName: 'prod',
      version: putNote.currentVersion
    });

    new codedeploy.LambdaDeploymentGroup(this, 'BlueGreenDeployment', {
      alias: versionAlias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
    });

    const listNotes = new lambdaNode.NodejsFunction(this, 'ListNotes', {
      entry: 'src/listNotes.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: notesTable.tableName
      }
    });

    notesTable.grant(putNote, "dynamodb:PutItem");
    notesTable.grant(listNotes, "dynamodb:Scan");

    const putNoteIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: putNote,
    });

    const listNotesIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: listNotes,
    });
    
    const httpApi = new apigateway.HttpApi(this, 'HttpApi');
    
    httpApi.addRoutes({
      path: '/notes',
      methods: [ apigateway.HttpMethod.POST ],
      integration: putNoteIntegration,
    });

    httpApi.addRoutes({
      path: '/notes',
      methods: [ apigateway.HttpMethod.GET ],
      integration: listNotesIntegration,
    });

    new cdk.CfnOutput(this, 'URL', { value: httpApi.apiEndpoint });
  }
}
