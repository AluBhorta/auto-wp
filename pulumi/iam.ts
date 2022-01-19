import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// iam for ecs

export const ecsTaskExecutionRole = new aws.iam.Role(
  "ecsTaskExecutionRole",
  {
    assumeRolePolicy: JSON.stringify({
      Version: "2008-10-17",
      Statement: [
        {
          Sid: "",
          Effect: "Allow",
          Principal: { Service: "ecs-tasks.amazonaws.com" },
          Action: "sts:AssumeRole",
        },
      ],
    }),
    forceDetachPolicies: false,
    maxSessionDuration: 3600,
    name: "ecsTaskExecutionRole",
    managedPolicyArns: [
      "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    ],
    path: "/",
  },
  {
    protect: true,
  }
);

const ecsAutoscaleRole = new aws.iam.Role(
  "ecsAutoscaleRole",
  {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Service: "application-autoscaling.amazonaws.com" },
          Action: "sts:AssumeRole",
        },
      ],
    }),
    forceDetachPolicies: false,
    maxSessionDuration: 3600,
    name: "ecsAutoscaleRole",
    path: "/",
    managedPolicyArns: [
      "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole",
    ],
  },
  {
    protect: true,
  }
);

// iam for codebuild

const codebuild_policy = new aws.iam.Policy(
  "codebuild_policy",
  {
    description: "Policy used in trust relationship with CodeBuild",
    name: "codebuild_policy",
    path: "/service-role/",
    policy: JSON.stringify({
      Statement: [
        {
          Action: [
            "ecr:GetRegistryPolicy",
            "ecr:DescribeRegistry",
            "ecr:DescribePullThroughCacheRules",
            "ecr:GetAuthorizationToken",
            "ecr:PutRegistryScanningConfiguration",
            "ecr:CreatePullThroughCacheRule",
            "ecr:DeletePullThroughCacheRule",
            "ecr:GetRegistryScanningConfiguration",
            "ecr:PutReplicationConfiguration",
          ],
          Effect: "Allow",
          Resource: "*",
        },
        {
          Action: [
            "ecr:PutImageTagMutability",
            "ecr:StartImageScan",
            "ecr:DescribeImageReplicationStatus",
            "ecr:ListTagsForResource",
            "ecr:BatchDeleteImage",
            "ecr:UploadLayerPart",
            "ecr:BatchGetRepositoryScanningConfiguration",
            "ecr:ListImages",
            "ecr:DeleteRepository",
            "codebuild:CreateReport",
            "logs:CreateLogStream",
            "codebuild:UpdateReport",
            "ecr:CompleteLayerUpload",
            "codebuild:BatchPutCodeCoverages",
            "ecr:TagResource",
            "ecr:DescribeRepositories",
            "ecr:BatchCheckLayerAvailability",
            "ecr:ReplicateImage",
            "ecr:GetLifecyclePolicy",
            "ecr:PutLifecyclePolicy",
            "ecr:DescribeImageScanFindings",
            "ecr:CreateRepository",
            "ecr:GetLifecyclePolicyPreview",
            "ecr:GetDownloadUrlForLayer",
            "ecr:PutImageScanningConfiguration",
            "s3:GetBucketAcl",
            "logs:CreateLogGroup",
            "logs:PutLogEvents",
            "ecr:DeleteLifecyclePolicy",
            "ecr:PutImage",
            "s3:PutObject",
            "s3:GetObject",
            "codebuild:CreateReportGroup",
            "ecr:UntagResource",
            "ecr:BatchGetImage",
            "ecr:DescribeImages",
            "ecr:StartLifecyclePolicyPreview",
            "s3:GetBucketLocation",
            "ecr:InitiateLayerUpload",
            "codebuild:BatchPutTestCases",
            "s3:GetObjectVersion",
            "ecr:GetRepositoryPolicy",
          ],
          Effect: "Allow",
          Resource: "*",
        },
      ],
      Version: "2012-10-17",
    }),
  },
  {
    protect: true,
  }
);

export const codebuild_role = new aws.iam.Role("codebuild_role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "codebuild.amazonaws.com",
        },
        Effect: "Allow",
        Sid: "",
      },
    ],
  }),
  managedPolicyArns: [codebuild_policy.arn], // NOTE: this is suggested on pulumi refresh after codebuild_policy_attachment is created
});

const codebuild_policy_attachment = new aws.iam.RolePolicyAttachment(
  "codebuild_policy_attachment",
  {
    role: codebuild_role,
    policyArn: codebuild_policy.arn,
  }
);

// iam for codepipeline

const codepipeline_policy = new aws.iam.Policy("codepipeline_policy", {
  description: "Policy used in trust relationship with CodePipeline",
  name: "codepipeline_policy",
  path: "/service-role/",
  policy: JSON.stringify({
    Statement: [
      {
        Action: ["iam:PassRole"],
        Condition: {
          StringEqualsIfExists: {
            "iam:PassedToService": [
              "cloudformation.amazonaws.com",
              "elasticbeanstalk.amazonaws.com",
              "ec2.amazonaws.com",
              "ecs-tasks.amazonaws.com",
              "codepipeline.amazonaws.com",
            ],
          },
        },
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "codecommit:CancelUploadArchive",
          "codecommit:GetBranch",
          "codecommit:GetCommit",
          "codecommit:GetRepository",
          "codecommit:GetUploadArchiveStatus",
          "codecommit:UploadArchive",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "codedeploy:CreateDeployment",
          "codedeploy:GetApplication",
          "codedeploy:GetApplicationRevision",
          "codedeploy:GetDeployment",
          "codedeploy:GetDeploymentConfig",
          "codedeploy:RegisterApplicationRevision",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: ["codestar-connections:UseConnection"],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "elasticbeanstalk:*",
          "ec2:*",
          "elasticloadbalancing:*",
          "autoscaling:*",
          "cloudwatch:*",
          "s3:*",
          "sns:*",
          "cloudformation:*",
          "rds:*",
          "sqs:*",
          "ecs:*",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: ["lambda:InvokeFunction", "lambda:ListFunctions"],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "opsworks:CreateDeployment",
          "opsworks:DescribeApps",
          "opsworks:DescribeCommands",
          "opsworks:DescribeDeployments",
          "opsworks:DescribeInstances",
          "opsworks:DescribeStacks",
          "opsworks:UpdateApp",
          "opsworks:UpdateStack",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "cloudformation:CreateStack",
          "cloudformation:DeleteStack",
          "cloudformation:DescribeStacks",
          "cloudformation:UpdateStack",
          "cloudformation:CreateChangeSet",
          "cloudformation:DeleteChangeSet",
          "cloudformation:DescribeChangeSet",
          "cloudformation:ExecuteChangeSet",
          "cloudformation:SetStackPolicy",
          "cloudformation:ValidateTemplate",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild",
          "codebuild:BatchGetBuildBatches",
          "codebuild:StartBuildBatch",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "devicefarm:ListProjects",
          "devicefarm:ListDevicePools",
          "devicefarm:GetRun",
          "devicefarm:GetUpload",
          "devicefarm:CreateUpload",
          "devicefarm:ScheduleRun",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "servicecatalog:ListProvisioningArtifacts",
          "servicecatalog:CreateProvisioningArtifact",
          "servicecatalog:DescribeProvisioningArtifact",
          "servicecatalog:DeleteProvisioningArtifact",
          "servicecatalog:UpdateProduct",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: ["cloudformation:ValidateTemplate"],
        Effect: "Allow",
        Resource: "*",
      },
      { Action: ["ecr:DescribeImages"], Effect: "Allow", Resource: "*" },
      {
        Action: [
          "states:DescribeExecution",
          "states:DescribeStateMachine",
          "states:StartExecution",
        ],
        Effect: "Allow",
        Resource: "*",
      },
      {
        Action: [
          "appconfig:StartDeployment",
          "appconfig:StopDeployment",
          "appconfig:GetDeployment",
        ],
        Effect: "Allow",
        Resource: "*",
      },
    ],
    Version: "2012-10-17",
  }),
});

export const codepipeline_role = new aws.iam.Role("codepipeline_role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "codepipeline.amazonaws.com",
        },
        Effect: "Allow",
        Sid: "",
      },
    ],
  }),
  managedPolicyArns: [codepipeline_policy.arn],
});

const codepipeline_policy_attachment = new aws.iam.RolePolicyAttachment(
  "codepipeline_policy_attachment",
  {
    role: codepipeline_role,
    policyArn: codepipeline_policy.arn,
  }
);
