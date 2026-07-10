#!/bin/bash

# A simple blue-green deployment script

# Determine the currently active environment based on nginx config
if grep -q "proxy_pass http://backend_blue;" nginx/nginx.conf; then
  ACTIVE="blue"
  INACTIVE="green"
else
  ACTIVE="green"
  INACTIVE="blue"
fi

echo "Currently active environment: $ACTIVE"
echo "Deploying to inactive environment: $INACTIVE"

# Start the inactive environment
docker compose --profile $INACTIVE up --scale backend-${INACTIVE}=3 -d backend-${INACTIVE}

# Wait for it to be healthy
echo "Waiting for backend-${INACTIVE} to become healthy..."
sleep 15

# Swap nginx upstream
sed -i "s/proxy_pass http:\/\/backend_${ACTIVE};/proxy_pass http:\/\/backend_${INACTIVE};/g" nginx/nginx.conf

# Reload nginx configuration
docker compose exec nginx nginx -s reload

echo "Swapped traffic to $INACTIVE"

# Stop the old environment
docker compose stop backend-${ACTIVE}

echo "Deployment complete! Active environment is now $INACTIVE"
