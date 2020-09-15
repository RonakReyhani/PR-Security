#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineStack } from "../lib/pipeline-stack";
import { StaticWebsiteStack } from "../lib/Frontend/frontend";

const prodAccount = { account: "477156370231", region: "ap-southeast-2" };
const prodDomainName = "prsafarigroup.com.au";
const prodBucketName = "prsafariwebsite";

const app = new cdk.App();

new PipelineStack(app, "PRSafariBuildStack", {
  env: prodAccount,
  prodEnv: prodAccount,
  prodResources: { websiteBucket: prodBucketName },
});

new StaticWebsiteStack(app, "StaticWebsiteStack", {
  acmCertArn: "arn:aws:acm:ap-southeast-2:477156370231:certificate/156bc034-0102-44f3-a1a0-6e8b57331077",
  bucketName: prodBucketName,
  prodAccount: prodAccount.account,
  domainName: prodDomainName,
  env: prodAccount,
});
