import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// route53 zone
export const cloudbits_hosted_zone = new aws.route53.Zone(
  "cloudbits-hosted-zone",
  {
    comment: "HostedZone created by Route53 Registrar",
    forceDestroy: false,
    name: "cloudbits.io",
  },
  {
    protect: true,
  }
);

// cert
export const auto_wp_cloudbits_cert = new aws.acm.Certificate(
  "auto-wp-cloudbits-cert",
  {
    domainName: "auto-wp.cloudbits.io",
    subjectAlternativeNames: ["*.auto-wp.cloudbits.io"],
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);

// cert validation
const validationRecords: aws.route53.Record[] = [];
const uniqueRecordNames: any = {};

auto_wp_cloudbits_cert.domainValidationOptions.apply((optionList) => {
  optionList
    .filter((option) => {
      if (option.resourceRecordName in uniqueRecordNames) {
        return false;
      }
      uniqueRecordNames[option.resourceRecordName] = true;
      return true;
    })
    .map((option, i) => {
      validationRecords.push(
        new aws.route53.Record(`validationRecord-${i}`, {
          zoneId: cloudbits_hosted_zone.zoneId,
          ttl: 60,
          name: option.resourceRecordName,
          type: option.resourceRecordType,
          records: [option.resourceRecordValue],
        })
      );
    });
});

const auto_wp_CertificateValidation = new aws.acm.CertificateValidation(
  "auto-wp-CertificateValidation",
  {
    certificateArn: auto_wp_cloudbits_cert.arn,
    validationRecordFqdns: validationRecords.map((rec) => rec.fqdn),
  }
);
