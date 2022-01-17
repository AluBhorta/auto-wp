import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {
  auto_wp_az1_subnet,
  auto_wp_az2_subnet,
  auto_wp_az3_subnet,
  auto_wp_vpc,
} from "./networking";

const auto_wp_alubhorta_com = new aws.acm.Certificate(
  "auto-wp.alubhorta.com",
  {
    domainName: "auto-wp.alubhorta.com",
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);
const auto_wp_lb = new aws.alb.LoadBalancer(
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
