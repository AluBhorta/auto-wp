import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const cicd_bucket = new aws.s3.Bucket("codepipeline-ap-south-1-281994180331", {
  acl: "private",
  forceDestroy: false,
});

// TODO: create separate roles for codebuild and codepipeline

const cicd_role = new aws.iam.Role("cicd_role", {
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
  managedPolicyArns: [
    "arn:aws:iam::aws:policy/AWSCodeBuildDeveloperAccess",
    "arn:aws:iam::aws:policy/CloudWatchFullAccess",
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess",
  ],
});

const codebuild_project = new aws.codebuild.Project(
  "auto_wp-codebuild-project1",
  {
    serviceRole: cicd_role.arn, // TODO !!!
    description: "Hey! This is my description!",
    buildTimeout: 10, // in minutes
    environment: {
      computeType: "BUILD_GENERAL1_SMALL",
      image: "aws/codebuild/amazonlinux2-x86_64-standard:3.0", // other images are available
      type: "LINUX_CONTAINER",
      privilegedMode: true,
      environmentVariables: [],
    },
    artifacts: { type: "CODEPIPELINE" },
    source: {
      type: "CODEPIPELINE",
      // buildspec: "buildspec.yaml", // or wherever your buildspec lives. Note you could target different buildspecs for the same repo
    },
    // logsConfig: { cloudwatchLogs: { groupName: "", streamName: "" } },
  },
  { dependsOn: [cicd_role] }
);

const auto_wp_pipeline = new aws.codepipeline.Pipeline(
  "auto-wp-pipeline",
  {
    artifactStore: {
      location: cicd_bucket.bucket,
      region: "",
      type: "S3",
    },
    name: "auto-wp-pipeline",
    roleArn:
      "arn:aws:iam::665186350589:role/service-role/AWSCodePipelineServiceRole-ap-south-1-auto-wp-pipeline",
    stages: [
      {
        name: "Source",
        actions: [
          {
            provider: "GitHub",
            version: "1",
            name: "GithubV1",
            category: "Source",
            owner: "ThirdParty",
            runOrder: 1,
            configuration: {
              Branch: "master",
              OAuthToken: process.env.GITHUB_ACCESS_TOKEN || "",
              Owner: "AluBhorta",
              Repo: "auto-wp",
              PollForSourceChanges: "true",
            },
            outputArtifacts: ["GitHubV1Src"],
          },
        ],
      },
      {
        name: "Build",
        actions: [
          {
            name: "Build",
            category: "Build",
            inputArtifacts: ["GitHubV1Src"],
            configuration: {
              ProjectName: codebuild_project.name, //"auto-wp-codebuild-project",
            },
            namespace: "BuildVariables",
            owner: "AWS",
            provider: "CodeBuild",
            region: "ap-south-1",
            roleArn: "",
            runOrder: 1,
            version: "1",
            outputArtifacts: ["BuildArtifact"],
          },
        ],
      },
      {
        name: "Deploy",
        actions: [
          {
            name: "Deploy",
            category: "Deploy",
            inputArtifacts: ["BuildArtifact"],
            provider: "ECS",
            configuration: {
              ClusterName: "auto-wp-ecs-cluster",
              DeploymentTimeout: "10",
              FileName: "imagedefinitions.json",
              ServiceName: "auto-wp-service",
            },
            namespace: "DeployVariables",
            outputArtifacts: [],
            owner: "AWS",
            region: "ap-south-1",
            roleArn: "",
            runOrder: 1,
            version: "1",
          },
        ],
      },
    ],
  },
  {
    protect: true,
  }
);
