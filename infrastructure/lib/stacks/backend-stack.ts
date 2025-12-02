import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface BackendStackProps extends cdk.StackProps {
  projectName: string;
  databaseSecret?: secretsmanager.ISecret;
}

export class BackendStack extends cdk.Stack {
  public readonly apiGateway: apigateway.RestApi;
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant database secret access if provided
    if (props.databaseSecret) {
      props.databaseSecret.grantRead(lambdaRole);
    }

    // Lambda function (AWS Free Tier: 1M requests/month, 400K GB-seconds)
    // Using 256MB memory = 0.25GB, so 400K GB-seconds = 1.6M seconds = ~444 hours/month
    this.lambdaFunction = new lambda.Function(this, 'BackendFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('../../backend'),
      role: lambdaRole,
      environment: {
        ENVIRONMENT: 'production',
        DATABASE_SECRET_ARN: props.databaseSecret?.secretArn || '',
      },
      timeout: cdk.Duration.seconds(30), // Free tier friendly
      memorySize: 256, // Free tier friendly (256MB = 0.25GB)
    });

    // API Gateway (AWS Free Tier: 1M requests/month for first 12 months)
    // After 12 months: $3.50 per million requests
    this.apiGateway = new apigateway.RestApi(this, 'BackendApi', {
      restApiName: `${props.projectName} API`,
      description: `API Gateway for ${props.projectName}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(this.lambdaFunction, {
      requestTemplates: { 'application/json': '{"statusCode": "200"}' },
    });

    // API routes
    this.apiGateway.root.addProxy({
      defaultIntegration: lambdaIntegration,
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.apiGateway.url,
      description: 'API Gateway URL (use this if no custom domain)',
    });
    
    new cdk.CfnOutput(this, 'ApiDevUrl', {
      value: this.apiGateway.url,
      description: 'Dev API URL',
    });
    
    new cdk.CfnOutput(this, 'ApiTestUrl', {
      value: this.apiGateway.url,
      description: 'Test API URL',
    });
    
    new cdk.CfnOutput(this, 'ApiProdUrl', {
      value: this.apiGateway.url,
      description: 'Production API URL',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.lambdaFunction.functionArn,
    });
  }
}
