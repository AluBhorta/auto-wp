import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const cicd_bucket = new aws.s3.Bucket("codepipeline-ap-south-1-281994180331", {
  acl: "private",
  forceDestroy: false,
});

const auto_wp_github_connection = new aws.codestarconnections.Connection(
  "auto-wp-github-connection",
  {
    name: "auto-wp-gh-con",
    providerType: "GitHub",
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
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
            category: "Source",
            configuration: {
              BranchName: "master",
              ConnectionArn: auto_wp_github_connection.arn,
              FullRepositoryId: "AluBhorta/auto-wp",
              OutputArtifactFormat: "CODE_ZIP",
            },
            inputArtifacts: [],
            name: "Source",
            namespace: "SourceVariables",
            outputArtifacts: ["SourceArtifact"],
            owner: "AWS",
            provider: "CodeStarSourceConnection",
            region: "ap-south-1",
            roleArn: "",
            runOrder: 1,
            version: "1",
          },
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
              PollForSourceChanges: "false",
            },
            outputArtifacts: ["GitHubSource"],
          },
        ],
      },
      {
        name: "Build",
        actions: [
          {
            category: "Build",
            configuration: {
              ProjectName: "auto-wp-codebuild-project",
            },
            inputArtifacts: ["SourceArtifact"],
            name: "Build",
            namespace: "BuildVariables",
            outputArtifacts: ["BuildArtifact"],
            owner: "AWS",
            provider: "CodeBuild",
            region: "ap-south-1",
            roleArn: "",
            runOrder: 1,
            version: "1",
          },
        ],
      },
      {
        name: "Deploy",
        actions: [
          {
            category: "Deploy",
            configuration: {
              ClusterName: "auto-wp-ecs-cluster",
              DeploymentTimeout: "10",
              FileName: "imagedefinitions.json",
              ServiceName: "auto-wp-service",
            },
            inputArtifacts: ["BuildArtifact"],
            name: "Deploy",
            namespace: "DeployVariables",
            outputArtifacts: [],
            owner: "AWS",
            provider: "ECS",
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
