#!/bin/sh
set -e

# Generate self-signed certificate at runtime to avoid baking secrets into the image
mkdir -p /etc/nginx/ssl
if [ ! -f /etc/nginx/ssl/selfsigned.key ]; then
    echo "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/selfsigned.key \
    -out /etc/nginx/ssl/selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Dev/CN=localhost"
fi

# Execute the main CMD (which is nginx -g daemon off;)
exec "$@"
