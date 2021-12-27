import pulumi
import pulumi_aws as aws

auto_wp_vpc = aws.ec2.Vpc("auto-wp-vpc",
    enable_dns_support=True,
    instance_tenancy="default",
    tags={
        "Name": "auto-wp-vpc",
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_az1_subnet = aws.ec2.Subnet("auto-wp-az1-subnet",
    assign_ipv6_address_on_creation=False,
    cidr_block="10.2.0.0/24",
    map_public_ip_on_launch=False,
    tags={
        "Name": "auto-wp-az1-subnet",
        "Project": "auto-wp",
    },
    vpc_id="vpc-08c55b550e17b22ab",
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_az2_subnet = aws.ec2.Subnet("auto-wp-az2-subnet",
    assign_ipv6_address_on_creation=False,
    cidr_block="10.2.1.0/24",
    map_public_ip_on_launch=False,
    tags={
        "Name": "auto-wp-az2-subnet",
        "Project": "auto-wp",
    },
    vpc_id="vpc-08c55b550e17b22ab",
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_pub_rt = aws.ec2.RouteTable("auto-wp-pub-rt",
    tags={
        "Name": "auto-wp-rt",
        "Project": "auto-wp",
    },
    vpc_id="vpc-08c55b550e17b22ab",
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_igw = aws.ec2.InternetGateway("auto-wp-igw",
    tags={
        "Name": "auto-wp-igw",
        "Project": "auto-wp",
    },
    vpc_id="vpc-08c55b550e17b22ab",
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_lb_sg = aws.ec2.SecurityGroup("auto-wp-lb-sg",
    description="SG for internet facing ALB",
    name="auto-wp-lb-sg",
    revoke_rules_on_delete=False,
    tags={
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_db_sg = aws.ec2.SecurityGroup("auto-wp-db-sg",
    description="SG for db",
    name="auto-wp-db-sg",
    revoke_rules_on_delete=False,
    tags={
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
auto_wp_web_sg = aws.ec2.SecurityGroup("auto-wp-web-sg",
    description="SG for web services on ecs",
    name="auto-wp-web-sg",
    revoke_rules_on_delete=False,
    tags={
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
default = aws.ec2.SecurityGroup("default",
    description="default VPC security group",
    name="default",
    revoke_rules_on_delete=False,
    opts=pulumi.ResourceOptions(protect=True))
