import pulumi
import pulumi_aws as aws

test_wp_db = aws.rds.Cluster("test-wp-db",
    backup_retention_period=1,
    copy_tags_to_snapshot=True,
    enable_global_write_forwarding=False,
    enable_http_endpoint=False,
    engine="aurora-mysql",
    engine_mode="provisioned",
    skip_final_snapshot=True,
    tags={
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
test_wp_db_instance_1 = aws.rds.ClusterInstance("test-wp-db-instance-1",
    auto_minor_version_upgrade=True,
    cluster_identifier="test-wp-db",
    copy_tags_to_snapshot=False,
    engine="aurora-mysql",
    instance_class="db.t2.small",
    monitoring_interval=60,
    promotion_tier=1,
    publicly_accessible=False,
    opts=pulumi.ResourceOptions(protect=True))
