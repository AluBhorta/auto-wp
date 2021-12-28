import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

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
    // subnets: [], TODO:
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);
