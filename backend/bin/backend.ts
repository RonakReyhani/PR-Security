#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineStack } from "../lib/pipeline-stack";
import { StaticWebsiteStack } from "../lib/Frontend/frontend";

const buildAccount = { account: "477156370231", region: "ap-southeast-2" };
const prodAccount = { account: "477156370231", region: "ap-southeast-2" };
const prodDomainName = "prsafarigroup.com.au";
const prodBucketName = "prsafariwebsite";

const app = new cdk.App();

new PipelineStack(app, "PRSafariBuildPipelineStack", {
  env: buildAccount,
  prodEnv: prodAccount,
  prodResources: { websiteBucket: prodBucketName },
});

new StaticWebsiteStack(app, "StaticWebsiteStack", {
  acmCertArn: "arn:aws:acm:us-east-1:179041247865:certificate/ac971731-50a9-4f27-a3ae-6e6576d3ef23",
  bucketName: prodBucketName,
  buildAccount: buildAccount.account,
  domainName: prodDomainName,
  env: prodAccount,
});
