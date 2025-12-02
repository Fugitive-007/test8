import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendStack } from './stacks/frontend-stack';
import { BackendStack } from './stacks/backend-stack';
import { DatabaseStack } from './stacks/database-stack';
import { DnsStack } from './stacks/dns-stack';

export interface AppStackProps extends cdk.StackProps {
  projectName: string;
  domain?: string;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Database stack (RDS for prod, EC2 for dev/test)
    const databaseStack = new DatabaseStack(this, 'DatabaseStack', {
      projectName: props.projectName,
      env: props.env,
    });

    // Backend stack (Lambda + API Gateway)
    const backendStack = new BackendStack(this, 'BackendStack', {
      projectName: props.projectName,
      databaseSecret: databaseStack.databaseSecret,
      env: props.env,
    });

    // Frontend stack (S3 + CloudFront)
    const frontendStack = new FrontendStack(this, 'FrontendStack', {
      projectName: props.projectName,
      env: props.env,
    });

    // DNS stack (Route53) - only if domain is provided
    if (props.domain) {
      new DnsStack(this, 'DnsStack', {
        projectName: props.projectName,
        domain: props.domain,
        frontendDistribution: frontendStack.distribution,
        apiGateway: backendStack.apiGateway,
        env: props.env,
      });
    }
  }
}
