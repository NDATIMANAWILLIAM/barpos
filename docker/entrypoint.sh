#!/bin/bash
set -e

export PORT="${PORT:-8080}"

# Render gives every web service its public HTTPS URL in RENDER_EXTERNAL_URL.
# Laravel needs it as APP_URL (used for asset/route generation).
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    export APP_URL="$RENDER_EXTERNAL_URL"
fi

envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

cd /var/www/html

php artisan config:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec supervisord -c /etc/supervisord.conf
