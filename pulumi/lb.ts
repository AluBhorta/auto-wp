import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {
  auto_wp_az1_subnet,
  auto_wp_az2_subnet,
  auto_wp_az3_subnet,
  auto_wp_vpc,
} from "./networking";
import { auto_wp_cloudbits_cert, cloudbits_hosted_zone } from "./dns";

export const auto_wp_lb = new aws.alb.LoadBalancer(
  "auto-wp-lb",
  {
    desyncMitigationMode: "defensive",
    dropInvalidHeaderFields: false,
    enableCrossZoneLoadBalancing: false,
    enableDeletionProtection: false,
    enableHttp2: true,
    enableWafFailOpen: false,
    idleTimeout: 60,
    loadBalancerType: "application",
    name: "auto-wp-lb",
    subnets: [
      auto_wp_az1_subnet.id,
      auto_wp_az2_subnet.id,
      auto_wp_az3_subnet.id,
    ],
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);

// alb tg

export const auto_wp_tg = new aws.alb.TargetGroup(
  "auto-wp-tg",
  {
    connectionTermination: false,
    deregistrationDelay: 300,
    lambdaMultiValueHeadersEnabled: false,
    name: "auto-wp-tg",
    port: 443,
    protocol: "HTTP",
    proxyProtocolV2: false,
    slowStart: 0,
    targetType: "ip",
    vpcId: auto_wp_vpc.id,
  },
  {
    protect: true,
  }
);

// alb dns

const alb_dns_record = new aws.route53.Record("alb_dns_record", {
  zoneId: cloudbits_hosted_zone.zoneId,
  ttl: 60,
  name: "auto-wp.cloudbits.io",
  type: "CNAME",
  records: [auto_wp_lb.dnsName],
});

// alb listeners

const alb_http_listener = new aws.alb.Listener(
  "alb_http_listener",
  {
    defaultActions: [
      {
        order: 1,
        redirect: {
          host: "#{host}",
          path: "/#{path}",
          port: "443",
          protocol: "HTTPS",
          query: "#{query}",
          statusCode: "HTTP_301",
        },
        targetGroupArn: "",
        type: "redirect",
      },
    ],
    loadBalancerArn: auto_wp_lb.arn,
    port: 80,
  },
  {
    protect: true,
  }
);

const alb_https_listener = new aws.alb.Listener(
  "alb_https_listener",
  {
    certificateArn: auto_wp_cloudbits_cert.arn,
    defaultActions: [
      {
        order: 1,
        targetGroupArn: auto_wp_tg.arn,
        type: "forward",
      },
    ],
    loadBalancerArn: auto_wp_lb.arn,
    port: 443,
  },
  {
    protect: true,
  }
);
