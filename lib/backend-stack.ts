import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from '../constants/credentials';

const rootDir = path.join(__dirname, '..');

export const commonLambdaProps: NodejsFunctionProps = {
  runtime: Runtime.NODEJS_20_X,
  projectRoot: rootDir,
  depsLockFilePath: path.join(rootDir, 'package-lock.json'),
  bundling: {
    externalModules: ['aws-sdk'],
    sourceMap: true,
    minify: false,
  },
};

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const backendHandler = new NodejsFunction(this, 'BackendHandler', {
      ...commonLambdaProps,
      environment: {
        DB_HOST,
        DB_PORT,
        DB_USERNAME,
        DB_PASSWORD,
        DB_DATABASE,
      },
      code: Code.fromAsset(path.join(rootDir, 'dist')),
      handler: 'main.handler',
      timeout: Duration.seconds(10),
    });

    const api = new RestApi(this, 'Api', {
      restApiName: 'RS Checkout API',
      description: 'RS Checkout API',
    });

    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(backendHandler),
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    new CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}
