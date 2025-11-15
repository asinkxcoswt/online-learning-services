import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { getSSMClient } from '../aws-clients/getSSMClient';

const ssm = getSSMClient();

const name = process.env.CF_SIGNING_KEY_PARAM_NAME;
const res = await ssm.send(
  new GetParameterCommand({
    Name: name,
    WithDecryption: true
  })
);

export async function getCloudFrontSignedUrl(s3ObjectKey: string, expiresInSeconds: number = 3600) {
  const cloudfrontDistributionDomain = process.env.CF_DISTRIBUTION_DOMAIN;
  const url = `https://${cloudfrontDistributionDomain}/${s3ObjectKey}`;
  const privateKey = res.Parameter?.Value!;
  const keyPairId = process.env.CF_KEY_PAIR_ID!;

  console.log('xxxcxvxcvxcvxcvxcvcxvxxvxcvvxcx', {
    url
  });

  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan: Date.now() + expiresInSeconds * 1000,
    privateKey
  });

  return signedUrl;
}
