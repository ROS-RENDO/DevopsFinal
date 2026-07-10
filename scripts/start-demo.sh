#!/bin/bash

# A script to deploy the application locally using GHCR images and expose it via Ngrok

# Ensure GHCR_REPO is set
if [ -z "$GHCR_REPO" ]; then
  echo "Error: GHCR_REPO is not set."
  echo "Example: export GHCR_REPO=camtech/devsec_final"
  echo "Please set it before running this script."
  exit 1
fi

echo "Pulling latest images from GHCR ($GHCR_REPO)..."
docker compose -f docker-compose.prod.yml pull

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
docker compose -f docker-compose.prod.yml --profile $INACTIVE up --scale backend-${INACTIVE}=3 -d backend-${INACTIVE}

# Wait for it to be healthy
echo "Waiting for backend-${INACTIVE} to become healthy..."
sleep 15

# Swap nginx upstream
sed -i "s/proxy_pass http:\/\/backend_${ACTIVE};/proxy_pass http:\/\/backend_${INACTIVE};/g" nginx/nginx.conf

# Ensure nginx is running and reload configuration
docker compose -f docker-compose.prod.yml up -d nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "Swapped traffic to $INACTIVE"

# Stop the old environment
docker compose -f docker-compose.prod.yml stop backend-${ACTIVE}

echo "Deployment complete! Active environment is now $INACTIVE"

echo "Starting Ngrok tunnel on port 443..."
echo "You can view your application at the URL provided by Ngrok in the terminal below."
# Assuming ngrok is installed and authenticated. We tunnel to the HTTPS port of Nginx.
ngrok http https://localhost:443
