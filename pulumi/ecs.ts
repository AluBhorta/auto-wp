import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { autoWpContainerEnvs } from "./envs";

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

const aws_efs_file_system = new aws.efs.FileSystem("myfs", {});

const aws_efs_access_point = new aws.efs.AccessPoint("myfs-ap", {
  fileSystemId: aws_efs_file_system.id,
});

const auto_wp_taskdef = new aws.ecs.TaskDefinition("auto_wp_taskdef", {
  cpu: "512",
  family: "auto_wp_taskdef",
  memory: "1024",
  networkMode: "awsvpc",
  executionRoleArn: "arn:aws:iam::665186350589:role/ecsTaskExecutionRole",
  requiresCompatibilities: ["FARGATE"],
  tags: { Project: "auto-wp" },
  volumes: [
    {
      name: "site_root",
      efsVolumeConfiguration: {
        fileSystemId: aws_efs_file_system.id,
        rootDirectory: "/opt/data",
        transitEncryption: "ENABLED",
        transitEncryptionPort: 2999,
        authorizationConfig: {
          accessPointId: aws_efs_access_point.id,
          iam: "ENABLED",
        },
      },
    },
  ],
  ephemeralStorage: {
    sizeInGib: 21,
  },
  containerDefinitions: JSON.stringify([
    {
      command: [],
      cpu: 0,
      dnsSearchDomains: [],
      dnsServers: [],
      dockerLabels: {},
      dockerSecurityOptions: [],
      entryPoint: [],
      environment: [...autoWpContainerEnvs],
      environmentFiles: [],
      essential: true,
      extraHosts: [],
      image: "665186350589.dkr.ecr.ap-south-1.amazonaws.com/auto-wp",
      links: [],
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/auto_wp_taskdef",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs",
        },
        secretOptions: [],
      },
      mountPoints: [
        {
          containerPath: "/var/www/html",
          readOnly: false,
          sourceVolume: "site_root",
        },
      ],
      name: "auto-wp",
      portMappings: [{ containerPort: 80, hostPort: 80, protocol: "tcp" }],
      secrets: [],
      systemControls: [],
      ulimits: [],
      volumesFrom: [],
    },
    {
      command: [],
      cpu: 512,
      dnsSearchDomains: [],
      dnsServers: [],
      dockerLabels: {},
      dockerSecurityOptions: [],
      entryPoint: [],
      environment: [],
      environmentFiles: [],
      essential: false,
      extraHosts: [],
      image: "docker.io/library/redis:alpine",
      links: [],
      logConfiguration: {
        logDriver: "awslogs",
        options: {
          "awslogs-create-group": "true",
          "awslogs-group": "/ecs/auto_wp_taskdef",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs",
        },
        secretOptions: [],
      },
      mountPoints: [],
      name: "redis",
      portMappings: [{ containerPort: 6379, hostPort: 6379, protocol: "tcp" }],
      secrets: [],
      systemControls: [],
      ulimits: [],
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
      environmentFiles: [],
      essential: true,
      extraHosts: [],
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
        secretOptions: [],
      },
      mountPoints: [],
      name: "aws-otel-collector",
      portMappings: [],
      secrets: [],
      systemControls: [],
      ulimits: [],
      volumesFrom: [],
    },
  ]),
});
