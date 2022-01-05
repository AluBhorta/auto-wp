import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const auto_wp_efs = new aws.efs.FileSystem("auto-wp-efs", {
  creationToken: "quickCreated-016712ff-fdaa-4e1c-ac61-cf1b88b6a050",
  lifecyclePolicy: {
    transitionToPrimaryStorageClass: "AFTER_1_ACCESS",
    // transitionToIa: "AFTER_30_DAYS",
  },
  tags: {
    Name: "auto-wp-efs",
    Project: "auto-wp",
  },
  throughputMode: "bursting",
});
