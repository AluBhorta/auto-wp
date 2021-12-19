#!/bin/bash

## -x Print commands and their arguments as they are executed.
#  http://linuxcommand.org/lc3_man_pages/seth.html
set -x

## Make the .env file
#   Credentials from secret: webserver-env
#
cp /var/www/html/.env.example /var/www/html/.env
sed -i 's|database_name|'$DB_NAME'|g' /var/www/html/.env
sed -i 's|database_user|'$DB_USER'|g' /var/www/html/.env
sed -i 's|database_password|'$DB_PASSWORD'|g' /var/www/html/.env
sed -i 's|localhost|'$DB_HOST'|g' /var/www/html/.env
sed -i 's|database_prefix|'$DB_PREFIX'|g' /var/www/html/.env
sed -i 's|development|'$WP_ENV'|g' /var/www/html/.env
sed -i "s|https://example.com|"$WP_HOME"|g" /var/www/html/.env
sed -i 's|redis_host|'$REDIS_HOST'|g' /var/www/html/.env
sed -i 's|redis_port|'$REDIS_PORT'|g' /var/www/html/.env
sed -i "s|redis_password|"$REDIS_AUTH"|g" /var/www/html/.env
