import pulumi
import pulumi_aws as aws

auto_wp_ecs_cluster = aws.ecs.Cluster("auto-wp-ecs-cluster",
    capacity_providers=[
        "FARGATE_SPOT",
        "FARGATE",
    ],
    name="auto-wp-ecs-cluster",
    tags={
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_service = aws.ecs.Service("auto-wp-service",
    capacity_provider_strategies=[aws.ecs.ServiceCapacityProviderStrategyArgs(
        capacity_provider="FARGATE",
        weight=1,
    )],
    deployment_maximum_percent=200,
    deployment_minimum_healthy_percent=100,
    desired_count=1,
    enable_ecs_managed_tags=False,
    enable_execute_command=False,
    health_check_grace_period_seconds=10,
    load_balancers=[aws.ecs.ServiceLoadBalancerArgs(
        container_name="auto-wp",
        container_port=80,
        target_group_arn="arn:aws:elasticloadbalancing:ap-south-1:665186350589:targetgroup/auto-wp-tg/6f271bcc4a920c33",
    )],
    name="auto-wp-service",
    network_configuration=aws.ecs.ServiceNetworkConfigurationArgs(
        security_groups=["sg-09ff63909b7aacc5c"],
        subnets=[
            "subnet-006293e929a925ee0",
            "subnet-026b07de9c771de15",
        ],
        assign_public_ip=True
    ),
    scheduling_strategy="REPLICA",
    tags={
        "Project": "auto-wp",
    },
    task_definition="auto-wp-tdef:13",
    wait_for_steady_state=False,
    opts=pulumi.ResourceOptions(protect=True))
