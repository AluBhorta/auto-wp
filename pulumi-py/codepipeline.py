import pulumi
import pulumi_aws as aws

auto_wp_pipeline = aws.codepipeline.Pipeline("auto-wp-pipeline",
    artifact_store=aws.codepipeline.PipelineArtifactStoreArgs(
        location="codepipeline-ap-south-1-281994180331",
        region="",
        type="S3",
    ),
    name="auto-wp-pipeline",
    role_arn="arn:aws:iam::665186350589:role/service-role/AWSCodePipelineServiceRole-ap-south-1-auto-wp-pipeline",
    stages=[
        aws.codepipeline.PipelineStageArgs(
            actions=[aws.codepipeline.PipelineStageActionArgs(
                category="Source",
                configuration={
                    "BranchName": "master",
                    "ConnectionArn": "arn:aws:codestar-connections:ap-south-1:665186350589:connection/dffcb7cd-897e-4dc7-b2eb-f854a4378398",
                    "FullRepositoryId": "AluBhorta/auto-wp",
                    "OutputArtifactFormat": "CODE_ZIP",
                },
                input_artifacts=[],
                name="Source",
                namespace="SourceVariables",
                output_artifacts=["SourceArtifact"],
                owner="AWS",
                provider="CodeStarSourceConnection",
                region="ap-south-1",
                role_arn="",
                run_order=1,
                version="1",
            )],
            name="Source",
        ),
        aws.codepipeline.PipelineStageArgs(
            actions=[aws.codepipeline.PipelineStageActionArgs(
                category="Build",
                configuration={
                    "ProjectName": "auto-wp-codebuild-project",
                },
                input_artifacts=["SourceArtifact"],
                name="Build",
                namespace="BuildVariables",
                output_artifacts=["BuildArtifact"],
                owner="AWS",
                provider="CodeBuild",
                region="ap-south-1",
                role_arn="",
                run_order=1,
                version="1",
            )],
            name="Build",
        ),
        aws.codepipeline.PipelineStageArgs(
            actions=[aws.codepipeline.PipelineStageActionArgs(
                category="Deploy",
                configuration={
                    "ClusterName": "auto-wp-ecs-cluster",
                    "DeploymentTimeout": "10",
                    "FileName": "imagedefinitions.json",
                    "ServiceName": "auto-wp-service",
                },
                input_artifacts=["BuildArtifact"],
                name="Deploy",
                namespace="DeployVariables",
                output_artifacts=[],
                owner="AWS",
                provider="ECS",
                region="ap-south-1",
                role_arn="",
                run_order=1,
                version="1",
            )],
            name="Deploy",
        ),
    ],
    opts=pulumi.ResourceOptions(protect=True))
