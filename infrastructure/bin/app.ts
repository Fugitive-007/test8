#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();

new AppStack(app, 'test8-stack', {
  env: {
    account: '180528248252',
    region: 'us-east-1',
  },
  projectName: 'Test8',
});
