#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { PipelineStack } from "../lib/pipeline-stack";
import { StaticWebsiteStack } from "../lib/Frontend/frontend";

const prodAccount = { account: "477156370231", region: "ap-southeast-2" };
const prodDomainName = "prsafarigroup.com.au";
const prodBucketName = "prsafariwebsite";
const prodSubDomainName = "www.prsafarigroup.com.au";

const app = new cdk.App();

new PipelineStack(app, "PRSafariBuildStack", {
  env: prodAccount,
  prodEnv: prodAccount,
  prodResources: { websiteBucket: prodBucketName },
});

new StaticWebsiteStack(app, "StaticWebsiteStack", {
  acmCertArn: "arn:aws:acm:us-east-1:477156370231:certificate/ab3c3226-c1c3-44bf-b271-81b802424854",
  bucketName: prodBucketName,
  prodAccount: prodAccount.account,
  domainName: prodDomainName,
  prodSubDomainName: prodSubDomainName,
  env: prodAccount,
});
