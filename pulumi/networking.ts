import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const auto_wp_vpc = new aws.ec2.Vpc(
  "auto-wp-vpc",
  {
    enableDnsSupport: true,
    instanceTenancy: "default",
    tags: {
      Name: "auto-wp-vpc",
      Project: "auto-wp",
    },
    cidrBlock: "10.2.0.0/16",
  },
  {
    protect: true,
  }
);

// igw
const auto_wp_igw = new aws.ec2.InternetGateway(
  "auto-wp-igw",
  {
    tags: {
      Name: "auto-wp-igw",
      Project: "auto-wp",
    },
    vpcId: auto_wp_vpc.id,
  },
  {
    protect: true,
  }
);

// subnets
const auto_wp_az1_subnet = new aws.ec2.Subnet(
  "auto-wp-az1-subnet",
  {
    assignIpv6AddressOnCreation: false,
    cidrBlock: "10.2.0.0/24",
    availabilityZone: "ap-south-1a",
    mapPublicIpOnLaunch: false,
    tags: {
      Name: "auto-wp-az1-subnet",
      Project: "auto-wp",
    },
    vpcId: auto_wp_vpc.id,
  },
  {
    protect: true,
  }
);
const auto_wp_az2_subnet = new aws.ec2.Subnet(
  "auto-wp-az2-subnet",
  {
    assignIpv6AddressOnCreation: false,
    cidrBlock: "10.2.1.0/24",
    availabilityZone: "ap-south-1b",
    mapPublicIpOnLaunch: false,
    tags: {
      Name: "auto-wp-az2-subnet",
      Project: "auto-wp",
    },
    vpcId: auto_wp_vpc.id,
  },
  {
    protect: true,
  }
);
const auto_wp_az3_subnet = new aws.ec2.Subnet(
  "auto-wp-az3-subnet",
  {
    assignIpv6AddressOnCreation: false,
    cidrBlock: "10.2.2.0/24",
    availabilityZone: "ap-south-1c",
    mapPublicIpOnLaunch: false,
    tags: {
      Name: "auto-wp-az3-subnet",
      Project: "auto-wp",
    },
    vpcId: auto_wp_vpc.id,
  },
  {
    protect: true,
  }
);

// rt and subnet-rt association
const auto_wp_pub_rt = new aws.ec2.RouteTable(
  "auto-wp-pub-rt",
  {
    routes: [
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: auto_wp_igw.id,
      },
    ],
    tags: {
      Name: "auto-wp-rt",
      Project: "auto-wp",
    },
    vpcId: auto_wp_vpc.id,
  },
  {
    protect: true,
  }
);

const auto_wp_subnet1_rt_assoc = new aws.ec2.RouteTableAssociation(
  "auto_wp_subnet1_rt_assoc",
  {
    routeTableId: auto_wp_pub_rt.id,
    subnetId: auto_wp_az1_subnet.id,
  }
);
const auto_wp_subnet2_rt_assoc = new aws.ec2.RouteTableAssociation(
  "auto_wp_subnet2_rt_assoc",
  {
    routeTableId: auto_wp_pub_rt.id,
    subnetId: auto_wp_az2_subnet.id,
  }
);
const auto_wp_subnet3_rt_assoc = new aws.ec2.RouteTableAssociation(
  "auto_wp_subnet3_rt_assoc",
  {
    routeTableId: auto_wp_pub_rt.id,
    subnetId: auto_wp_az3_subnet.id,
  }
);

// SGs
const auto_wp_lb_sg = new aws.ec2.SecurityGroup(
  "auto-wp-lb-sg",
  {
    description: "SG for internet facing ALB",
    name: "auto-wp-lb-sg",
    ingress: [
      {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "tcp",
        fromPort: 443,
        toPort: 443,
      },
      {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
      },
    ],
    egress: [
      {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        self: false,
      },
    ],
    revokeRulesOnDelete: false,
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);
const auto_wp_web_sg = new aws.ec2.SecurityGroup(
  "auto-wp-web-sg",
  {
    description: "SG for web services on ecs",
    name: "auto-wp-web-sg",
    ingress: [
      {
        cidrBlocks: ["103.59.178.246/32"],
        protocol: "tcp",
        fromPort: 22,
        toPort: 22,
      },
      {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "tcp",
        fromPort: 80,
        toPort: 80,
      },
    ],
    egress: [
      {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        self: false,
      },
    ],
    revokeRulesOnDelete: false,
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);
const auto_wp_db_sg = new aws.ec2.SecurityGroup(
  "auto-wp-db-sg",
  {
    description: "SG for db",
    name: "auto-wp-db-sg",
    ingress: [
      {
        securityGroups: [auto_wp_web_sg.id],
        protocol: "tcp",
        fromPort: 3306,
        toPort: 3306,
      },
    ],
    egress: [
      {
        cidrBlocks: ["0.0.0.0/0"],
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        self: false,
      },
    ],
    revokeRulesOnDelete: false,
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);

const _default = new aws.ec2.SecurityGroup(
  "default",
  {
    description: "default VPC security group",
    name: "default",
    revokeRulesOnDelete: false,
  },
  {
    protect: true,
  }
);
