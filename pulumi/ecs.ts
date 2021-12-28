import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const auto_wp_ecs_cluster = new aws.ecs.Cluster(
  "auto-wp-ecs-cluster",
  {
    capacityProviders: ["FARGATE_SPOT", "FARGATE"],
    name: "auto-wp-ecs-cluster",
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);

const auto_wp_service = new aws.ecs.Service(
  "auto-wp-service",
  {
    name: "auto-wp-service",
    taskDefinition: "wp-tdef:13",
    schedulingStrategy: "REPLICA",
    waitForSteadyState: false,
    deploymentMaximumPercent: 200,
    deploymentMinimumHealthyPercent: 100,
    desiredCount: 1,
    enableEcsManagedTags: false,
    enableExecuteCommand: false,
    healthCheckGracePeriodSeconds: 10,
    loadBalancers: [
      {
        containerName: "auto-wp",
        containerPort: 80,
        targetGroupArn:
          "arn:aws:elasticloadbalancing:ap-south-1:665186350589:targetgroup/auto-wp-tg/6f271bcc4a920c33",
      },
    ],
    networkConfiguration: {
      assignPublicIp: true,
      securityGroups: ["sg-09ff63909b7aacc5c"],
      subnets: ["subnet-006293e929a925ee0", "subnet-026b07de9c771de15"],
    },
    capacityProviderStrategies: [
      {
        capacityProvider: "FARGATE",
        weight: 1,
      },
    ],
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);
