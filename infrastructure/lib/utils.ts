// Utility functions for CDK stacks

export function getEnvironment(): string {
  return process.env.ENVIRONMENT || 'dev';
}

export function getStackName(projectName: string, env: string): string {
  return `${projectName}-${env}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}
