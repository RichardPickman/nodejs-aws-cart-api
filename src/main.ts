import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';

import { Handler } from 'aws-cdk-lib/aws-lambda';
import { AppModule } from './app.module';

import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context } from 'aws-lambda';

const port = process.env.PORT || 4000;

let server;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();

  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());

  console.log('App is running on %s port', port);

  return server(event, context, callback);
};
