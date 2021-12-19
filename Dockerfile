# FROM lightbulb
#   https://github.com/cloudbitsio/lightbulb-alpine
#
FROM docker.io/cloudbitsio/lightbulb-alpine:latest AS builder

# Configure Filament
RUN cp /etc/nginx/templates/no-ssl-fastcgi.conf /etc/nginx/sites-available/httpd.conf ; \
    sed -i 's|REPLACE|127.0.0.1:9000|g' /etc/nginx/conf.d/php-fpm.conf

WORKDIR /var/www/html

# Docker multi-stage for different environments
#   docker build --target development -t namespace/auto-wp.local:development . 
#       EQUAL to running docker-compose up -d --build
#   docker build --target production -t namespace/auto-wp.local:production .
#       OR use an external build tool
FROM builder AS development
    ENV ENV=development
    RUN sed -i 's|auto-wp.local|DEVELOPMENT|g' /etc/nginx/sites-available/httpd.conf ; \
        ln -s /etc/nginx/sites-available/* /etc/nginx/sites-enabled/

FROM builder AS production
    ENV ENV=production
    COPY --chown=www-data ./site/ /var/www/html
    RUN sed -i 's|auto-wp.local|PRODUCTION|g' /etc/nginx/sites-available/httpd.conf ; \
        ln -s /etc/nginx/sites-available/* /etc/nginx/sites-enabled/ ; \
        chmod +x /var/www/html/poststart.sh
