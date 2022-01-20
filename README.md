# auto-wp

Wordpress with CI/CD using AWS CodePipeline and infrastructure automation (IaC) using Pulumi.

## Getting started

### Prerequisites

- [install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [configure it](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) using the access and secret keys of your AWS IAM account
- [install pulumi](https://www.pulumi.com/docs/get-started/install/)
- install [docker](https://docs.docker.com/get-docker/) and [docker compose v2](https://docs.docker.com/compose/cli-command/)

### Usage: local development

- and env vars in a file named `.env`

  ```conf
  DOCKER_ENV_TARGET=development   # development | production
  AWS_IAM_ACCOUNT_ID="YOUR-AWS_IAM_ACCOUNT_ID"
  DB_NAME='database_name'
  DB_USER='database_user'
  DB_PASSWORD='database_password'
  DB_HOST='mariadb'
  REDIS_HOST='redis'
  REDIS_PORT='6379'
  WP_ENV=$DOCKER_ENV_TARGET
  WP_HOME='http://localhost'
  WP_SITEURL="${WP_HOME}/wp"
  AUTH_KEY='YOUR_SECRET-AUTH_KEY'
  SECURE_AUTH_KEY='YOUR_SECRET-SECURE_AUTH_KEY'
  LOGGED_IN_KEY='YOUR_SECRET-LOGGED_IN_KEY'
  NONCE_KEY='YOUR_SECRET-NONCE_KEY'
  AUTH_SALT='YOUR_SECRET-AUTH_SALT'
  SECURE_AUTH_SALT='YOUR_SECRET-SECURE_AUTH_SALT'
  LOGGED_IN_SALT='YOUR_SECRET-LOGGED_IN_SALT'
  NONCE_SALT='YOUR_SECRET-NONCE_SALT'
  ```

  - NOTE: you can generate [`AUTH_KEY`, `SECURE_AUTH_KEY`, `LOGGED_IN_KEY`, `NONCE_KEY`, `AUTH_SALT`, `SECURE_AUTH_SALT`, `LOGGED_IN_SALT`, `NONCE_SALT`] with [WordPress salts generator](https://roots.io/salts.html)

- run system locally using docker compose

  ```sh
  docker compose up -d
  ```

- stop the system

  ```sh
  docker compose down
  ```

  use `-v` flag to also remove saved volumes

### Usage: production environment

- generate a github access token from your github account with the following scopes:

  - `repo`
  - `workflow`
  - `write:repo_hook`
  - `read:repo_hook`

- and env vars in a file named `.prod.env`

  ```conf
  AWS_IAM_ACCOUNT_ID="YOUR-AWS_IAM_ACCOUNT_ID"
  GITHUB_ACCESS_TOKEN='YOUR-GITHUB_ACCESS_TOKEN'
  DB_HOST='YOUR-RDS-CLUSTER-URL'
  DB_NAME='YOUR_RDS_DBNAME'
  DB_PASSWORD='YOUR_RDS_PASSWORD'
  DB_USER='YOUR_RDS_PASSWORD'
  ENV='production'
  WP_ENV='production'
  FQDN='http://auto-wp.cloudbits.io'
  WP_HOME='http://auto-wp.cloudbits.io'
  WP_SITEURL='http://auto-wp.cloudbits.io/wp'
  AUTH_KEY='YOUR_SECRET-AUTH_KEY'
  SECURE_AUTH_KEY='YOUR_SECRET-SECURE_AUTH_KEY'
  LOGGED_IN_KEY='YOUR_SECRET-LOGGED_IN_KEY'
  NONCE_KEY='YOUR_SECRET-NONCE_KEY'
  AUTH_SALT='YOUR_SECRET-AUTH_SALT'
  SECURE_AUTH_SALT='YOUR_SECRET-SECURE_AUTH_SALT'
  LOGGED_IN_SALT='YOUR_SECRET-LOGGED_IN_SALT'
  NONCE_SALT='YOUR_SECRET-NONCE_SALT'
  ```

  NOTE: replace [ `FQDN`, `WP_HOME`, `WP_SITEURL` ] with your own custom subdomain

- replace the `ACCOUNT_ID=665186350589` on `buildspec.yml` to your own `AWS_IAM_ACCOUNT_ID`

- Create or update resources with pulumi

  ```sh
  pulumi up
  ```

- Remove all resources with pulumi

  ```sh
  pulumi destroy
  ```

## Notes

- the `ap-south-1` AWS region has been used and hard coded throughout the project. you may need to change it according to your needs.
- check [issues](issues.md) faced during project.
- learn about [importing resources](import.md) from aws console to pulumi.
