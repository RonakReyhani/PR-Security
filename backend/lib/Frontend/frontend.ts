import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
import * as certmgr from "@aws-cdk/aws-certificatemanager";

interface envProps extends cdk.StackProps {
  acmCertArn: string;
  bucketName: string;
  buildAccount: string;
  domainName: string;
  env: {
    account: string;
    region: string;
  };
}

export class StaticWebsiteStack extends cdk.Stack {
  public constructor(scope: cdk.Construct, id: string, props: envProps) {
    super(scope, id, props);

    const oai = new cloudfront.OriginAccessIdentity(this, "OAI");
    const websiteBucket = new s3.Bucket(this, "prsafariwebsite", {
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      bucketName: props.bucketName,
    });

    websiteBucket.grantRead(oai);
    websiteBucket.grantReadWrite(new iam.AccountPrincipal(props.buildAccount));

    const cloudfrontDist = new cloudfront.CloudFrontWebDistribution(this, "PRSafariWebsiteHostingDistribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.seconds(0),
              defaultTtl: cdk.Duration.seconds(0),
            },
          ],
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      loggingConfig: {
        bucket: new s3.Bucket(this, "CloudFrontLogs"),
        includeCookies: true,
        prefix: "cloudfrontLogs",
      },
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
        certmgr.Certificate.fromCertificateArn(this, "AcmCertCloudfront", props.acmCertArn),
        {
          aliases: [props.domainName],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        },
      ),
      errorConfigurations: [
        {
          errorCachingMinTtl: 0,
          errorCode: 404,
          responseCode: 404,
          responsePagePath: "/error.html",
        },
      ],
    });
  }
}
