#!/bin/bash

# A script to deploy the application locally using GHCR images and expose it via Ngrok

# Change to the project root directory
cd "$(dirname "$0")/.." || exit 1

# Ensure GHCR_REPO is set (default to the current repository)
if [ -z "$GHCR_REPO" ]; then
  export GHCR_REPO="ros-rendo/devopsfinal"
  echo "GHCR_REPO was not set, automatically defaulting to: $GHCR_REPO"
fi

echo "Pulling latest images from GHCR ($GHCR_REPO)..."
GHCR_REPO="$GHCR_REPO" docker compose -f docker-compose.prod.yml pull

# Determine the currently active environment based on nginx config
if grep -q "set \$active_backend \"backend-blue\";" nginx/nginx.conf; then
  ACTIVE="blue"
  INACTIVE="green"
else
  ACTIVE="green"
  INACTIVE="blue"
fi

echo "Currently active environment: $ACTIVE"
echo "Deploying to inactive environment: $INACTIVE"

# Start the inactive environment
GHCR_REPO="$GHCR_REPO" docker compose -f docker-compose.prod.yml --profile $INACTIVE up --scale backend-${INACTIVE}=3 -d backend-${INACTIVE}

# Wait for it to be healthy
echo "Waiting for backend-${INACTIVE} to become healthy..."
sleep 15

# Swap nginx upstream
sed -i "s/set \$active_backend \"backend-${ACTIVE}\";/set \$active_backend \"backend-${INACTIVE}\";/g" nginx/nginx.conf

# Ensure nginx is running
GHCR_REPO="$GHCR_REPO" docker compose -f docker-compose.prod.yml up -d nginx

# Copy the updated Nginx config into the container (since it's baked into the image)
GHCR_REPO="$GHCR_REPO" docker compose -f docker-compose.prod.yml cp nginx/nginx.conf nginx:/etc/nginx/conf.d/default.conf

# Reload configuration inside the container
GHCR_REPO="$GHCR_REPO" docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "Swapped traffic to $INACTIVE"

# Stop the old environment
GHCR_REPO="$GHCR_REPO" docker compose -f docker-compose.prod.yml stop backend-${ACTIVE}

echo "Deployment complete! Active environment is now $INACTIVE"

