import { SecurityGroup, Subnet, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Stack } from 'sst/constructs';
import { LocalConfig } from './local';
import { ProductionConfig } from './production';
import { DeploymentConfig } from './types';

function getDeploymentConfig(stage: string): DeploymentConfig {
  if (stage === 'production') {
    return ProductionConfig;
  }

  return LocalConfig;
}

export function resolveStackConfig(stack: Stack) {
  const config = getDeploymentConfig(stack.stage);
  return {
    ...config,
    vpc: config.VPC_ID
      ? Vpc.fromLookup(stack, 'VPC', {
          vpcId: config.VPC_ID
        })
      : undefined,
    vpcSubnets: config.SUBNET_ID_1
      ? {
          subnets: [Subnet.fromSubnetId(stack, 'geto/api-subnet-1', config.SUBNET_ID_1)]
        }
      : undefined,
    securityGroups: config.SECURITY_GROUP_ID ? [SecurityGroup.fromSecurityGroupId(stack, 'geto/api-sg', config.SECURITY_GROUP_ID)] : undefined,
    customDomains: config.HOSTED_ZONE
      ? {
          functions: config.API_DOMAIN
            ? {
                domainName: config.API_DOMAIN,
                hostedZone: config.HOSTED_ZONE
              }
            : undefined
        }
      : undefined,
    urls: {
      // web.url will be empty in dev mode, so default to localhost, please make sure the port is correct in vite.config.ts
      api: config.API_DOMAIN ? `https://${config.API_DOMAIN}` : 'http://localhost:3003'
    }
  };
}
