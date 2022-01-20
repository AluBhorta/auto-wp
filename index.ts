import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { config } from "dotenv";
config({ path: "./.prod.env" });

import "./networking";
import "./dns";
import "./rds";
import "./lb";
import "./ecs";
import "./codepipeline";
