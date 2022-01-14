import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

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
              PollForSourceChanges: "false",
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
              ProjectName: "auto-wp-codebuild-project",
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
