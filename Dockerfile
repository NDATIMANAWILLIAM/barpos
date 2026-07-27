# ---- Stage 1: build frontend assets (Vite/React) ----
FROM node:20-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: install PHP dependencies ----
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# ---- Stage 3: runtime image ----
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
        nginx supervisor bash gettext \
        libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev \
        postgresql-dev icu-dev oniguruma-dev curl-dev

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_pgsql pdo_mysql mbstring curl gd bcmath zip intl pcntl exif opcache

# Fail the build here (with a clear message) instead of deploying an image
# that will only error at runtime when Laravel tries to open a DB connection.
RUN php -r '\
    $required = ["pdo_pgsql", "pdo_mysql", "mbstring", "curl", "gd", "bcmath", "zip", "intl", "pcntl", "exif"]; \
    $missing = array_filter($required, fn($e) => !extension_loaded($e)); \
    if (!function_exists("opcache_get_status")) { $missing[] = "opcache"; } \
    if ($missing) { echo "Missing PHP extensions: " . implode(", ", $missing) . "\n"; exit(1); } \
    echo "All required PHP extensions loaded OK\n";'

RUN apk del libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev postgresql-dev icu-dev oniguruma-dev curl-dev

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html
COPY --from=assets /app/public/build /var/www/html/public/build

COPY docker/nginx.conf.template /etc/nginx/http.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
