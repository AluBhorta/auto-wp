# auto-wp

Wordpress with CI/CD using AWS CodePipeline and infrastructure automation (IaC) using Pulumi.

## Getting started

### Prerequisites

- [install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) using your access and secret keys
- [install pulumi](https://www.pulumi.com/docs/get-started/install/)

### Setting up environment

**local development**

- TODO

**production environment**

- TODO

### Infrastructure automation with Pulumi

Create or update resources

```sh
pulumi up
```

Remove all resources

```sh
pulumi destroy
```

---

## Notes

- the `ap-south-1` AWS region has been used and hard coded throughout the project. you may need to change it according to your needs.
- check [issues](issues.md) faced during project.
- learn about [importing resources](import.md) from aws console to pulumi.
