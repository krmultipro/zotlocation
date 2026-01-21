FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    git \
    libicu-dev \
    libpq-dev \
    unzip \
    && docker-php-ext-install intl pdo_pgsql opcache \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

COPY composer.json composer.lock symfony.lock ./
COPY .env .env
COPY . .
RUN mkdir -p /var/www/html/var \
    && chown -R www-data:www-data /var/www/html/var \
    && chmod -R 775 /var/www/html/var

RUN APP_ENV=prod APP_DEBUG=0 composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
