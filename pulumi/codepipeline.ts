import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const auto_wp_pipeline = new aws.codepipeline.Pipeline("auto-wp-pipeline", {
    artifactStore: {
        location: "codepipeline-ap-south-1-281994180331",
        region: "",
        type: "S3",
    },
    name: "auto-wp-pipeline",
    roleArn: "arn:aws:iam::665186350589:role/service-role/AWSCodePipelineServiceRole-ap-south-1-auto-wp-pipeline",
    stages: [
        {
            actions: [{
                category: "Source",
                configuration: {
                    BranchName: "master",
                    ConnectionArn: "arn:aws:codestar-connections:ap-south-1:665186350589:connection/dffcb7cd-897e-4dc7-b2eb-f854a4378398",
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
            }],
            name: "Source",
        },
        {
            actions: [{
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
            }],
            name: "Build",
        },
        {
            actions: [{
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
            }],
            name: "Deploy",
        },
    ],
}, {
    protect: true,
});
