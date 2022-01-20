import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { auto_wp_efs } from "./efs";
import { ecsTaskExecutionRole } from "./iam";
import { auto_wp_tg } from "./lb";
import {
  auto_wp_az1_subnet,
  auto_wp_az2_subnet,
  auto_wp_az3_subnet,
  auto_wp_web_sg,
} from "./networking";

const ECS_TASKDEF_FAMILY = "wp-tdef";

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

export const wp_taskdef = new aws.ecs.TaskDefinition(
  "wp-tdef-27",
  {
    containerDefinitions: JSON.stringify([
      {
        command: [],
        cpu: 0,
        dnsSearchDomains: [],
        dnsServers: [],
        dockerSecurityOptions: [],
        entryPoint: [],
        environment: [
          { name: "AUTH_KEY", value: process.env.AUTH_KEY },
          { name: "AUTH_SALT", value: process.env.AUTH_SALT },
          { name: "DB_HOST", value: process.env.DB_HOST },
          { name: "DB_NAME", value: process.env.DB_NAME },
          { name: "DB_PASSWORD", value: process.env.DB_PASSWORD },
          { name: "DB_USER", value: process.env.DB_USER },
          { name: "ENV", value: process.env.ENV },
          { name: "FQDN", value: process.env.FQDN },
          { name: "LOGGED_IN_KEY", value: process.env.LOGGED_IN_KEY },
          { name: "LOGGED_IN_SALT", value: process.env.LOGGED_IN_SALT },
          { name: "NONCE_KEY", value: process.env.NONCE_KEY },
          { name: "NONCE_SALT", value: process.env.NONCE_SALT },
          { name: "SECURE_AUTH_KEY", value: process.env.SECURE_AUTH_KEY },
          { name: "SECURE_AUTH_SALT", value: process.env.SECURE_AUTH_SALT },
          { name: "WP_ENV", value: process.env.WP_ENV },
          { name: "WP_HOME", value: process.env.WP_HOME },
          { name: "WP_SITEURL", value: process.env.WP_SITEURL },
        ],
        essential: true,
        image: "665186350589.dkr.ecr.ap-south-1.amazonaws.com/auto-wp",
        links: [],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-create-group": "true",
            "awslogs-group": "/ecs/wp-tdef",
            "awslogs-region": "ap-south-1",
            "awslogs-stream-prefix": "ecs",
          },
        },
        mountPoints: [
          {
            containerPath: "/var/www/html/web/app/uploads",
            readOnly: false,
            sourceVolume: "efs_site_root",
          },
        ],
        name: "auto-wp",
        portMappings: [{ containerPort: 80, hostPort: 80, protocol: "tcp" }],
        systemControls: [],
        volumesFrom: [],
      },
      {
        command: [],
        cpu: 0,
        dnsSearchDomains: [],
        dnsServers: [],
        dockerLabels: {},
        dockerSecurityOptions: [],
        entryPoint: [],
        environment: [],
        essential: false,
        image: "docker.io/library/redis:alpine",
        links: [],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-create-group": "true",
            "awslogs-group": "/ecs/wp-tdef",
            "awslogs-region": "ap-south-1",
            "awslogs-stream-prefix": "ecs",
          },
        },
        mountPoints: [],
        name: "redis",
        portMappings: [
          { containerPort: 6379, hostPort: 6379, protocol: "tcp" },
        ],
        systemControls: [],
        volumesFrom: [],
      },
      {
        command: ["--config=/etc/ecs/ecs-xray.yaml"],
        cpu: 0,
        dnsSearchDomains: [],
        dnsServers: [],
        dockerLabels: {},
        dockerSecurityOptions: [],
        entryPoint: [],
        environment: [],
        essential: true,
        image: "public.ecr.aws/aws-observability/aws-otel-collector:v0.14.1",
        links: [],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-create-group": "true",
            "awslogs-group": "/ecs/ecs-aws-otel-sidecar-collector",
            "awslogs-region": "ap-south-1",
            "awslogs-stream-prefix": "ecs",
          },
        },
        mountPoints: [],
        name: "aws-otel-collector",
        portMappings: [],
        systemControls: [],
        volumesFrom: [],
      },
    ]),
    networkMode: "awsvpc",
    cpu: "512",
    executionRoleArn: ecsTaskExecutionRole.arn,
    family: ECS_TASKDEF_FAMILY,
    memory: "1024",
    requiresCompatibilities: ["FARGATE"],
    tags: {
      Project: "auto-wp",
      "ecs:taskDefinition:createdFrom": "ecs-console-v2",
      "ecs:taskDefinition:stackId":
        "arn:aws:cloudformation:ap-south-1:665186350589:stack/ECS-Console-V2-TaskDefinition-3df623b8-0219-4aa1-ab73-542f9c61a54c/487b6620-6238-11ec-8227-062cc17e076a",
    },
    volumes: [
      {
        efsVolumeConfiguration: {
          authorizationConfig: {
            iam: "DISABLED",
          },
          fileSystemId: auto_wp_efs.id,
          rootDirectory: "/",
          transitEncryption: "DISABLED",
        },
        name: "efs_site_root",
      },
    ],
  },
  {
    protect: true,
  }
);

const auto_wp_service = new aws.ecs.Service(
  "auto-wp-service",
  {
    name: "auto-wp-service",
    taskDefinition: aws.ecs
      .getTaskDefinition({ taskDefinition: ECS_TASKDEF_FAMILY })
      .then((tdefRes) => `${tdefRes.family}:${tdefRes.revision}`),
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
        targetGroupArn: auto_wp_tg.arn,
      },
    ],
    networkConfiguration: {
      assignPublicIp: true,
      securityGroups: [auto_wp_web_sg.id],
      subnets: [
        auto_wp_az1_subnet.id,
        auto_wp_az2_subnet.id,
        auto_wp_az3_subnet.id,
      ],
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

// ecs service autoscaling

const ecs_autoscaling_target = new aws.appautoscaling.Target(
  "ecs-autoscaling-target",
  {
    maxCapacity: 4,
    minCapacity: 1,
    resourceId: "service/auto-wp-ecs-cluster/auto-wp-service",
    scalableDimension: "ecs:service:DesiredCount",
    serviceNamespace: "ecs",
  },
  {
    protect: true,
  }
);

const ecs_autoscaling_policy = new aws.appautoscaling.Policy(
  "ecs-autoscaling-policy",
  {
    name: "auto-wp-ecs-autoscale-policy",
    policyType: "TargetTrackingScaling",
    resourceId: ecs_autoscaling_target.resourceId,
    scalableDimension: ecs_autoscaling_target.scalableDimension,
    serviceNamespace: ecs_autoscaling_target.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
      predefinedMetricSpecification: {
        predefinedMetricType: "ECSServiceAverageCPUUtilization",
      },
      scaleInCooldown: 300,
      scaleOutCooldown: 300,
      targetValue: 75,
    },
  },
  {
    protect: true,
  }
);
