# Infrastructure as Code - Test8

This directory contains AWS CDK code for provisioning infrastructure.

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK CLI: `npm install -g aws-cdk`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (see `.env.example`)

3. Bootstrap CDK (first time only):
   ```bash
   cdk bootstrap
   ```

## Deployment

Deploy all stacks:
```bash
npm run deploy
```

Deploy specific stack:
```bash
cdk deploy <stack-name>
```

## Teardown

Destroy all infrastructure:
```bash
npm run destroy
```

## Stack Structure

- **FrontendStack**: S3 + CloudFront for static hosting
- **BackendStack**: Lambda + API Gateway for API
- **DatabaseStack**: RDS PostgreSQL instance
- **DnsStack**: Route53 DNS records (optional, costs $0.50/month)

## AWS Free Tier Compliance

This infrastructure is configured to stay within AWS Free Tier limits:

### ✅ Free Tier Resources (Permanent)
- **S3**: 5GB storage, 20K GET requests/month
- **CloudFront**: 1TB data transfer/month
- **Lambda**: 1M requests/month, 400K GB-seconds

### ⚠️ Free Tier Resources (12 Months Only)
- **API Gateway**: 1M requests/month (then $3.50/million)
- **RDS**: db.t2.micro, 20GB storage, 750 hours/month

### 💰 Always Paid Services
- **Route53**: $0.50/month per hosted zone (only if using custom domain)
- **Secrets Manager**: $0.40/month per secret

### ⚠️ Important Limits
- **RDS**: Only 1 Free Tier RDS instance allowed per AWS account
- **Multiple Projects**: Consider sharing RDS or using separate AWS accounts

## Cost Optimization Tips

1. **Use Default AWS URLs**: Skip Route53 ($0.50/month saved)
2. **Share RDS**: Use one RDS instance for multiple projects (if within limits)
3. **Monitor Usage**: Set up AWS Budgets alerts
4. **Disable Unused Resources**: Destroy stacks when not in use

## Environments

- **dev**: Development environment
- **test**: Testing environment  
- **prod**: Production environment (RDS only)
