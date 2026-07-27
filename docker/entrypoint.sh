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

# Seeding is safe to re-run on every boot: it only uses firstOrCreate() and
# never overwrites an existing user's password, so this won't clobber real
# data once you start using the app for real. Useful for the Render test
# deployment so login credentials always exist without a manual step.
php artisan db:seed --force

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec supervisord -c /etc/supervisord.conf
