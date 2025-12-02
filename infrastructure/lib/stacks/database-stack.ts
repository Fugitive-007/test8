import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  projectName: string;
}

export class DatabaseStack extends cdk.Stack {
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly databaseInstance?: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // VPC for RDS (required)
    const vpc = new ec2.Vpc(this, 'DatabaseVpc', {
      maxAzs: 2,
      natGateways: 0, // Cost optimization - remove for production
    });

    // Database secret
    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `${props.projectName.toLowerCase()}-db-secret`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    // RDS PostgreSQL instance (PROD only - AWS Free Tier compliant)
    // Free Tier: db.t2.micro, 20GB storage, 750 hours/month
    // NOTE: AWS allows only 1 Free Tier RDS instance per account
    this.databaseInstance = new rds.DatabaseInstance(this, 'DatabaseInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: rds.InstanceType.of(rds.InstanceClass.BURSTABLE2, rds.InstanceSize.MICRO), // Free Tier: db.t2.micro
      vpc,
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      databaseName: props.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      publiclyAccessible: false,
      allocatedStorage: 20, // Free Tier: 20GB storage limit
      maxAllocatedStorage: 20, // Don't auto-scale beyond free tier
      storageEncrypted: false, // Encryption costs extra, disabled for free tier
      backupRetention: cdk.Duration.days(0), // Disable backups to stay in free tier (7 days = extra cost)
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.databaseInstance.instanceEndpoint.socketAddress,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
    });
  }
}
