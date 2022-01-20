import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { codebuild_role, codepipeline_role } from "./iam";

// codebuild

const codebuild_project = new aws.codebuild.Project(
  "auto_wp-codebuild-project1",
  {
    serviceRole: codebuild_role.arn,
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
    },
    // logsConfig: { cloudwatchLogs: { groupName: "", streamName: "" } },
  },
  { dependsOn: [codebuild_role] }
);

// codepipeline

const cicd_bucket = new aws.s3.Bucket("codepipeline-ap-south-1-281994180331", {
  acl: "private",
  forceDestroy: false,
});

const auto_wp_pipeline = new aws.codepipeline.Pipeline(
  "auto-wp-pipeline",
  {
    artifactStore: {
      location: cicd_bucket.bucket,
      region: "",
      type: "S3",
    },
    name: "auto-wp-pipeline",
    roleArn: codepipeline_role.arn,
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
