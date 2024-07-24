import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
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
  depsLockFilePath: path.join(rootDir, 'pnpm-lock.yaml'),
  bundling: {
    externalModules: [
      'aws-sdk',
      '@nestjs/microservices',
      '@nestjs/websockets',
      'class-transformer',
      'class-validator',
    ],
    minify: true,
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
      entry: path.join(rootDir, 'dist', 'src', 'main.js'),
      timeout: Duration.seconds(10),
    });

    const api = new RestApi(this, 'Api', {
      restApiName: 'RS Checkout API',
      description: 'RS Checkout API',
    });

    api.root.addProxy({
      defaultIntegration: new LambdaIntegration(backendHandler),
      anyMethod: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
    });

    new CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
    });
  }
}
