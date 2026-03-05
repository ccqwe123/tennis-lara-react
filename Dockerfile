# -------------------------
# Stage 1: Build frontend
# -------------------------
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------------
# Stage 2: PHP + Laravel
# -------------------------
FROM php:8.2-fpm-alpine

WORKDIR /var/www/html

# Install system packages
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    curl

# Install PHP extensions (including MySQL)
RUN docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Copy built frontend from previous stage
COPY --from=build /app/public/build ./public/build

# Create a basic .env so composer scripts don't crash
RUN cp .env.example .env

# Install PHP dependencies WITHOUT running Laravel scripts
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Fix permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=9000"]
