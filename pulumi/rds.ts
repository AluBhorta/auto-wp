import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const test_wp_db = new aws.rds.Cluster("test-wp-db", {
    backupRetentionPeriod: 1,
    copyTagsToSnapshot: true,
    enableGlobalWriteForwarding: false,
    enableHttpEndpoint: false,
    engine: "aurora-mysql",
    engineMode: "provisioned",
    skipFinalSnapshot: true,
    tags: {
        Project: "auto-wp",
    },
}, {
    protect: true,
});
const test_wp_db_instance_1 = new aws.rds.ClusterInstance("test-wp-db-instance-1", {
    autoMinorVersionUpgrade: true,
    clusterIdentifier: "test-wp-db",
    copyTagsToSnapshot: false,
    engine: "aurora-mysql",
    instanceClass: "db.t2.small",
    monitoringInterval: 60,
    promotionTier: 1,
    publiclyAccessible: false,
}, {
    protect: true,
});
