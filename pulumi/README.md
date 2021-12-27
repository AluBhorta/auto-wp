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

### NOTE

- ACM certificate validation can be done using pulumi via [CertificateValidation](https://www.pulumi.com/registry/packages/aws/api-docs/acm/certificatevalidation/) (which uses route53), instead of using manual DNS record update
