# imports

> importing resources from aws console to pulumi

here's an example of importing an rds cluster:

- add a json file (e.g. `resources.json`) describing resources to import along with their IDs

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

- call import and specify output

  ```sh
  pulumi import -f resources/rds.json -o rds.ts
  ```

- additionally add the file to index.ts if it already doesn't exist or is not imported by any other imported ts file

  ```sh
  echo 'import "./rds";' >> index.ts
  ```

PS: learn more about importing resources from the [official docs](https://www.pulumi.com/docs/guides/adopting/import/).
