#!/bin/bash
set -e

echo "====================================="
echo "  Jayka Backend - Starting up..."
echo "====================================="

cd /var/www

# Install Composer dependencies if needed
if [ ! -d "vendor" ]; then
    echo "[1/5] Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
else
    echo "[1/5] Vendor directory found, skipping composer install."
fi

# Generate APP_KEY if empty
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY= $" .env; then
    echo "[2/5] Generating application key..."
    php artisan key:generate --force
else
    echo "[2/5] APP_KEY already set."
fi

# Wait for PostgreSQL to be ready
echo "[3/5] Waiting for PostgreSQL to be ready..."
MAX_TRIES=30
TRIES=0
until php -r "
    \$conn = @pg_connect('host=${DB_HOST} port=${DB_PORT} dbname=${DB_DATABASE} user=${DB_USERNAME} password=${DB_PASSWORD}');
    exit(\$conn ? 0 : 1);
" 2>/dev/null; do
    TRIES=$((TRIES + 1))
    if [ $TRIES -ge $MAX_TRIES ]; then
        echo "ERROR: PostgreSQL did not become available in time. Exiting."
        exit 1
    fi
    echo "  PostgreSQL not ready yet... (attempt $TRIES/$MAX_TRIES)"
    sleep 2
done
echo "  PostgreSQL is ready!"

# Run migrations
echo "[4/5] Running database migrations..."
php artisan migrate --force

# Run seeders (only if tables are empty)
echo "[5/5] Running database seeders..."
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tail -n1 | tr -d '[:space:]')
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "  Seeding database with initial data..."
    php artisan db:seed --force
else
    echo "  Database already has data, skipping seeders."
fi

# Fix storage permissions
echo "Fixing storage permissions..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "====================================="
echo "  Setup complete! Starting php-fpm..."
echo "====================================="

exec "$@"
