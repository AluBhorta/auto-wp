import pulumi
import pulumi_aws as aws

auto_wp_alubhorta_com = aws.acm.Certificate("auto-wp.alubhorta.com", tags={
    "Project": "auto-wp",
},
opts=pulumi.ResourceOptions(protect=True))
auto_wp_lb = aws.alb.LoadBalancer("auto-wp-lb",
    desync_mitigation_mode="defensive",
    drop_invalid_header_fields=False,
    enable_cross_zone_load_balancing=False,
    enable_deletion_protection=False,
    enable_http2=True,
    enable_waf_fail_open=False,
    idle_timeout=60,
    load_balancer_type="application",
    name="auto-wp-lb",
    tags={
        "Project": "auto-wp",
    },
    opts=pulumi.ResourceOptions(protect=True))
