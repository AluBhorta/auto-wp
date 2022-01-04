# FROM lightbulb
#   https://github.com/cloudbitsio/lightbulb-alpine
#
# FROM docker.io/cloudbitsio/lightbulb-alpine:latest AS builder     # using private repo as dockerhub has rate limits: https://www.docker.com/increase-rate-limit
FROM 665186350589.dkr.ecr.ap-south-1.amazonaws.com/lightbulb-alpine:latest AS builder

# Configure Filament
RUN cp /etc/nginx/templates/no-ssl-fastcgi.conf /etc/nginx/sites-available/httpd.conf ; \
    sed -i 's|REPLACE|127.0.0.1:9000|g' /etc/nginx/conf.d/php-fpm.conf

COPY --chown=www-data ./site/composer.* /var/www/html/
WORKDIR /var/www/html
RUN composer install

# Docker multi-stage for different environments
#     docker compose build
# or: docker build --target development -t namespace/example.com:development . 
# or: docker build --target production -t namespace/example.com:production .
FROM builder AS development
ENV ENV=development
COPY --chown=www-data ./site/ /var/www/html
RUN sed -i 's|example.com|localhost|g' /etc/nginx/sites-available/httpd.conf && \
    ln -s /etc/nginx/sites-available/* /etc/nginx/sites-enabled/


FROM builder AS production
ENV ENV=production
COPY --chown=www-data ./site/ /var/www/html
RUN sed -i 's|example.com|auto-wp.alubhorta.com|g' /etc/nginx/sites-available/httpd.conf && \
    ln -s /etc/nginx/sites-available/* /etc/nginx/sites-enabled/ && \
    chmod +x /var/www/html/poststart.sh && \
    /var/www/html/poststart.sh

VOLUME ["/var/www/html"]

