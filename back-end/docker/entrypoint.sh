#!/bin/sh
set -e
mkdir -p /var/www/html/var/cache/prod
chown -R www-data:www-data /var/www/html/var
chmod -R 775 /var/www/html/var
exec apache2-foreground
