#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';

import 'source-map-support/register';

const app = new cdk.App();
new BackendStack(app, 'BackendStack');
