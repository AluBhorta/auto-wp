import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const auto_wp_db_cluster_pg = new aws.rds.ClusterParameterGroup(
  "auto-wp-db-cluster-pg",
  {
    description: "rds aurora mysql cluster parameter group for auto-wp",
    family: "aurora-mysql5.7",
    name: "auto-wp-db-cluster-pg",
    parameters: [
      {
        applyMethod: "immediate",
        name: "general_log",
        value: "1",
      },
      {
        applyMethod: "immediate",
        name: "slow_query_log",
        value: "1",
      },
    ],
  },
  {
    protect: true,
  }
);

const auto_wp_db_pg = new aws.rds.ParameterGroup(
  "auto-wp-db-pg",
  {
    description: "rds aurora mysql parameter group for auto-wp",
    family: "aurora-mysql5.7",
    name: "auto-wp-db-pg",
    parameters: [
      {
        applyMethod: "immediate",
        name: "slow_query_log",
        value: "1",
      },
      {
        applyMethod: "immediate",
        name: "general_log",
        value: "1",
      },
    ],
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);

const test_wp_db = new aws.rds.Cluster(
  "test-wp-db",
  {
    backupRetentionPeriod: 1,
    copyTagsToSnapshot: true,
    enableGlobalWriteForwarding: false,
    enableHttpEndpoint: false,
    engine: "aurora-mysql",
    engineMode: "provisioned",
    skipFinalSnapshot: true,
    // allowMajorVersionUpgrade: true,
    dbClusterParameterGroupName: auto_wp_db_cluster_pg.name,
    dbInstanceParameterGroupName: auto_wp_db_pg.name,
    enabledCloudwatchLogsExports: ["general", "error", "audit", "slowquery"],
    tags: {
      Project: "auto-wp",
    },
  },
  {
    protect: true,
  }
);

const test_wp_db_instance_1 = new aws.rds.ClusterInstance(
  "test-wp-db-instance-1",
  {
    autoMinorVersionUpgrade: true,
    clusterIdentifier: test_wp_db.id,
    copyTagsToSnapshot: false,
    engine: "aurora-mysql",
    instanceClass: "db.t2.small",
    monitoringInterval: 60,
    promotionTier: 1,
    dbParameterGroupName: auto_wp_db_pg.name,
    publiclyAccessible: false,
  },
  {
    protect: true,
  }
);
