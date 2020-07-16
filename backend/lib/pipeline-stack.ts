import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as iam from "@aws-cdk/aws-iam";

// Synthesised Stack Names
const PRFES = "StaticWebsiteStack";

interface envProps extends cdk.StackProps {
  env: {
    account: string;
    region: string;
  };
  prodEnv: {
    account: string;
    region: string;
  };
  prodResources: {
    websiteBucket: string;
  };
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: envProps) {
    super(scope, id, props);

    // Pre-requisites of the pipeline
    const oauth = cdk.SecretValue.secretsManager("pr-safari-github-token");
    const sourceOutput = new codepipeline.Artifact();
    const cdkBuildOutput = new codepipeline.Artifact("CdkBuildOutput");
    const cdkBuild = new codebuild.PipelineProject(this, "CdkBuild", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": { nodejs: 12 },
            commands: ["cd backend", "npm install"],
          },
          build: {
            commands: ["npm run build", "npm run cdk synth -- -o dist"],
          },
        },
        artifacts: {
          "base-directory": "backend/dist",
          files: [`${this.stackName}.template.json`, `${PRFES}.template.json`],
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
      },
    });

    const deployToS3 = new codebuild.PipelineProject(this, "deployToS3", {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              `aws s3 sync frontEnd/ s3://${props.prodResources.websiteBucket} \
              --delete --cache-control no-cache --acl public-read`,
            ],
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
      },
    });

    // Allow codebuild to use the S3 service.
    // We need to put this here so that the build account grants the codebuild role permissions to
    // use S3 as well as in the destination account to allow writing to the destination bucket.
    deployToS3.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "s3:DeleteObject*",
          "s3:PutObject*",
          "s3:Abort*",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:s3:::${props.prodResources.websiteBucket}`,
          `arn:aws:s3:::${props.prodResources.websiteBucket}/*`,
        ],
      }),
    );

    // The Build Pipeline
    new codepipeline.Pipeline(this, "PRSafariBuildPipeline", {
      stages: [
        {
          stageName: "Source",
          actions: [
            new codepipeline_actions.GitHubSourceAction({
              owner: "RonakReyhani",
              repo: "PR-Security",
              output: sourceOutput,
              actionName: "GitHubSource",
              oauthToken: oauth,
              trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
        {
          stageName: "BuildAndAdministerPipeline",
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: "CDK_Build",
              project: cdkBuild,
              input: sourceOutput,
              outputs: [cdkBuildOutput],
              runOrder: 1,
            }),
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: "AdministerPipeline",
              templatePath: cdkBuildOutput.atPath(`${this.stackName}.template.json`),
              stackName: this.stackName,
              adminPermissions: true,
              parameterOverrides: {},
              runOrder: 2,
            }),
          ],
        },
        {
          stageName: "PRSafariWebsite",
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              account: props.prodEnv.account,
              actionName: "DeployFrontEndInfrastructure",
              adminPermissions: true,
              // Hard coded as cdk only synthesises the template. The deployment is separate.
              templatePath: cdkBuildOutput.atPath(`${PRFES}.template.json`),
              stackName: "StaticWebsiteFrontEnd",
              region: props.prodEnv.region,
              runOrder: 1,
            }),
            new codepipeline_actions.CodeBuildAction({
              actionName: "deployToS3",
              project: deployToS3,
              input: sourceOutput,
              runOrder: 2,
            }),
          ],
        },
      ],
      restartExecutionOnUpdate: true,
    });
  }
}
