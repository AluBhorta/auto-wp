# Provision resources using Pulumi TS

## Usage

### requirements:

- pulumi
- AWS cli (with a profile configured using `aws configure`)

### provision

```sh
pulumi up
```

NOTE: all resources cannot yet be fully provisioned automatically using the command above. this is because there are some errors when import is executed against certain resources. check "Issues" section below.

### import resources from console to pulumi

add a json file (e.g. `resources/rds.json`) describing resources to import along with their IDs

```json
{
  "resources": [
    {
      "type": "aws:rds/cluster:Cluster",
      "name": "test-wp-db",
      "id": "test-wp-db"
    }
  ]
}
```

call import and specify output

```sh
pulumi import -f resources/rds.json -o rds.ts
```

additionally add the file to index.ts if it already doesn't exist

```sh
echo 'import "./rds";' >> index.ts
```

## Issues

- ecs taskdef import issue

  - import json

    ```json
    {
      "type": "aws:ecs/taskDefinition:TaskDefinition",
      "name": "auto-wp-tdef:11",
      "id": "arn:aws:ecs:ap-south-1:665186350589:task-definition/auto-wp-tdef:11"
    }
    ```

  - error log

    ```log
    error: internal error: Error: Missing attribute separator

      on anonymous.pp line 10:
      9:     tags ={
      11:         ecs:taskDefinition:createdFrom = "ecs-console-v2",

    Expected a newline or comma to mark the beginning of the next attribute.

    ```

- codebuild import issue

  - import json

    ```json
    {
      "type": "aws:codebuild/project:Project",
      "name": "auto-wp-codebuild-project",
      "id": "auto-wp-codebuild-project"
    }
    ```

  - error log

    ```log
    Diagnostics:
    aws:codebuild:Project (auto-wp-codebuild-project):
      error: aws:codebuild/project:Project resource 'auto-wp-codebuild-project' has a problem: expected artifacts.0.namespace_type to be one of [NONE BUILD_ID], got . Examine values at 'Project.Artifacts.NamespaceType'.
      error: aws:codebuild/project:Project resource 'auto-wp-codebuild-project' has a problem: invalid value for environment.0.certificate (must end in .pem or .zip). Examine values at 'Project.Environment.Certificate'.
      error: Preview failed: one or more inputs failed to validate

    pulumi:pulumi:Stack (auto-wp-pulumi-ts-dev):
      error: preview failed
    ```

- imcomplete import of ecs cluster and ecs service, i.e. some properties were not properly imported.
  - the buggy imports
    - capacityProviders of cluster
    - assignPublicIp of service.networkConfiguration
    - subnets of service.networkConfiguration

  - error log

    ```log
    Do you want to perform this update? details
    pulumi:pulumi:Stack: (same)
    [urn=urn:pulumi:dev::auto-wp-pulumi-py::pulumi:pulumi:Stack::auto-wp-pulumi-py-dev]
    ~ aws:ecs/cluster:Cluster: (update) 🔒
        [id=arn:aws:ecs:ap-south-1:665186350589:cluster/auto-wp-ecs-cluster]
        [urn=urn:pulumi:dev::auto-wp-pulumi-py::aws:ecs/cluster:Cluster::auto-wp-ecs-cluster]
        [provider=urn:pulumi:dev::auto-wp-pulumi-py::pulumi:providers:aws::default_4_33_0::c31d94b3-8180-4c22-9e81-c078a5da019e]
      ~ capacityProviders: [
          - [0]: "FARGATE_SPOT"
        ]
    ~ aws:ecs/service:Service: (update) 🔒
        [id=arn:aws:ecs:ap-south-1:665186350589:service/auto-wp-ecs-cluster/auto-wp-service]
        [urn=urn:pulumi:dev::auto-wp-pulumi-py::aws:ecs/service:Service::auto-wp-service]
        [provider=urn:pulumi:dev::auto-wp-pulumi-py::pulumi:providers:aws::default_4_33_0::c31d94b3-8180-4c22-9e81-c078a5da019e]
      ~ networkConfiguration: {
          ~ assignPublicIp: true => false
          ~ subnets       : [
              - [0]: "subnet-006293e929a925ee0"
            ]
        }
    ```

---

import errors might be related to [this issue](https://github.com/pulumi/pulumi/issues/6146).

### NOTE

- ACM certificate validation can be done using pulumi via [CertificateValidation](https://www.pulumi.com/registry/packages/aws/api-docs/acm/certificatevalidation/) (which uses route53), instead of using manual DNS record update