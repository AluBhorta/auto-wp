import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const auto_wp_vpc = new aws.ec2.Vpc("auto-wp-vpc", {
    enableDnsSupport: true,
    instanceTenancy: "default",
    tags: {
        Name: "auto-wp-vpc",
        Project: "auto-wp",
    },
}, {
    protect: true,
});
const auto_wp_az1_subnet = new aws.ec2.Subnet("auto-wp-az1-subnet", {
    assignIpv6AddressOnCreation: false,
    cidrBlock: "10.2.0.0/24",
    mapPublicIpOnLaunch: false,
    tags: {
        Name: "auto-wp-az1-subnet",
        Project: "auto-wp",
    },
    vpcId: "vpc-08c55b550e17b22ab",
}, {
    protect: true,
});
const auto_wp_az2_subnet = new aws.ec2.Subnet("auto-wp-az2-subnet", {
    assignIpv6AddressOnCreation: false,
    cidrBlock: "10.2.1.0/24",
    mapPublicIpOnLaunch: false,
    tags: {
        Name: "auto-wp-az2-subnet",
        Project: "auto-wp",
    },
    vpcId: "vpc-08c55b550e17b22ab",
}, {
    protect: true,
});
const auto_wp_pub_rt = new aws.ec2.RouteTable("auto-wp-pub-rt", {
    tags: {
        Name: "auto-wp-rt",
        Project: "auto-wp",
    },
    vpcId: "vpc-08c55b550e17b22ab",
}, {
    protect: true,
});
const auto_wp_igw = new aws.ec2.InternetGateway("auto-wp-igw", {
    tags: {
        Name: "auto-wp-igw",
        Project: "auto-wp",
    },
    vpcId: "vpc-08c55b550e17b22ab",
}, {
    protect: true,
});
const auto_wp_lb_sg = new aws.ec2.SecurityGroup("auto-wp-lb-sg", {
    description: "SG for internet facing ALB",
    name: "auto-wp-lb-sg",
    revokeRulesOnDelete: false,
    tags: {
        Project: "auto-wp",
    },
}, {
    protect: true,
});
const auto_wp_db_sg = new aws.ec2.SecurityGroup("auto-wp-db-sg", {
    description: "SG for db",
    name: "auto-wp-db-sg",
    revokeRulesOnDelete: false,
    tags: {
        Project: "auto-wp",
    },
}, {
    protect: true,
});
const auto_wp_web_sg = new aws.ec2.SecurityGroup("auto-wp-web-sg", {
    description: "SG for web services on ecs",
    name: "auto-wp-web-sg",
    revokeRulesOnDelete: false,
    tags: {
        Project: "auto-wp",
    },
}, {
    protect: true,
});
const _default = new aws.ec2.SecurityGroup("default", {
    description: "default VPC security group",
    name: "default",
    revokeRulesOnDelete: false,
}, {
    protect: true,
});
