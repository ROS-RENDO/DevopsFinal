# Nginx Test Guide

This folder contains the Nginx reverse proxy config used to test HTTPS and route `/api` requests to the backend.

## What Nginx does here

- listens on port `80`
- redirects HTTP to HTTPS
- listens on port `443` with TLS enabled
- serves the frontend static files
- forwards `/api` requests to the backend

This setup does not use Nginx as a load balancer. There is only one backend service, so Nginx is acting as a reverse proxy and HTTPS terminator.

## Current config file

The main file is:

- `nginx.conf`

## How to understand the flow

1. The browser opens the site using `https://...`
2. Nginx receives the request
3. Nginx decrypts the HTTPS traffic
4. Nginx serves the frontend or forwards `/api` requests to the backend
5. The backend responds
6. Nginx sends the final response back to the browser

## What you need before testing

- backend running
- frontend build created with `npm run build`
- Nginx running with a valid certificate and key

## How to get certificates

### For local testing

For local testing, you usually create a self-signed certificate yourself.

The easiest way is to use `mkcert`:

1. Install mkcert.

```powershell
choco install mkcert
```

2. Install the local certificate authority.

```powershell
mkcert -install
```

3. Generate cert files for localhost.

```powershell
cd "C:\Users\Yup 2\Documents\Camtech\DevSec_Final\DevopsFinal\nginx"
mkdir certs
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1
```

This creates:

- `cert.pem`
- `key.pem`

These files go in `nginx/certs`.

### For production

In production, you normally use a certificate from a trusted Certificate Authority instead of a self-signed certificate.

Common options are:

- Let’s Encrypt with Certbot
- cloud-managed certificates from AWS, Azure, or Google Cloud
- a paid CA such as DigiCert or Sectigo

For many apps, Let’s Encrypt is the most common free choice.

Simple idea:

- local testing = self-signed certs are okay
- production = use a trusted CA-issued certificate

## Important note about `proxy_pass`

Your current `nginx.conf` uses:

```nginx
proxy_pass http://backend:5000;
```

That works when Nginx and the backend are in Docker on the same network and the backend service is named `backend`.

If Nginx is running locally on your machine outside Docker, change it to:

```nginx
proxy_pass http://localhost:5000;
```

## How to test Nginx locally

### Option 1: Nginx outside Docker

1. Start the backend:

```powershell
cd "C:\Users\Yup 2\Documents\Camtech\DevSec_Final\DevopsFinal\backend"
docker compose up --build
```

2. Build the frontend:

```powershell
cd "C:\Users\Yup 2\Documents\Camtech\DevSec_Final\DevopsFinal\frontend"
npm run build
```

3. Point Nginx to the frontend build folder.

4. Update `proxy_pass` in `nginx.conf` to `http://localhost:5000`.

5. Start Nginx.

6. Open:

- `http://localhost` to check redirect to HTTPS
- `https://localhost` to check the frontend
- `https://localhost/api/health` or your auth routes to check backend proxying

### Option 2: Nginx in Docker

If you later add an Nginx container, keep:

```nginx
proxy_pass http://backend:5000;
```

because the backend service name must match the Docker Compose service name.

## How to test that HTTPS is working

### 1. Check the redirect

Open `http://localhost`.

Expected result:
- the browser redirects to `https://localhost`

### 2. Check the TLS connection

Open `https://localhost`.

Expected result:
- the browser shows a secure HTTPS connection
- you may see a warning if you are using a self-signed certificate

### 3. Check the API proxy

Send a request to a backend route through Nginx.

Example:

- `https://localhost/api/auth/login`
- `https://localhost/api/auth/register`
- `https://localhost/api/auth/me`

Expected result:
- Nginx forwards the request to the backend
- the backend handles the request
- the response comes back through Nginx

## How to confirm from the code

In `nginx.conf`:

- `listen 443 ssl;` means HTTPS/TLS is enabled
- `ssl_certificate` and `ssl_certificate_key` point to the certificate files
- `return 301 https://$host$request_uri;` redirects HTTP to HTTPS
- `location /api/ { ... }` forwards API requests to the backend
- `location / { ... }` serves the frontend

## Simple summary

- Nginx is the reverse proxy, not a load balancer
- HTTPS/TLS is handled by Nginx
- frontend pages are served by Nginx
- backend API requests are forwarded by Nginx

## Files related to Nginx testing

- `nginx.conf`
- `README.md`
- frontend build output in `frontend/dist`
- backend routes in `backend/src/routes/`
