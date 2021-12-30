import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export const auto_wp_efs = new aws.efs.FileSystem("auto-wp-efs", {
  encrypted: true,
  tags: {
    Project: "auto-wp",
  },
});
