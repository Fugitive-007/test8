import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export interface FrontendStackProps extends cdk.StackProps {
  projectName: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3 bucket for static hosting (AWS Free Tier: 5GB storage, 20K GET requests/month)
    this.bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `${props.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-frontend-${this.account}-${this.region}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution (AWS Free Tier: 1TB data transfer/month - PERMANENT)
    this.distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe (cheapest)
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'FrontendDistributionId', {
      value: this.distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Frontend CloudFront URL (use this if no custom domain)',
    });
    
    new cdk.CfnOutput(this, 'FrontendDevUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Dev environment URL',
    });
    
    new cdk.CfnOutput(this, 'FrontendTestUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Test environment URL',
    });
    
    new cdk.CfnOutput(this, 'FrontendProdUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Production environment URL',
    });
  }
}
