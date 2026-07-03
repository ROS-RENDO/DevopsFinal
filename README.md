# DevSec_Final

This repository contains a full-stack security demo built with a React frontend, an Express backend, and an Nginx reverse proxy for deployment.

The project focuses on:

- safer secret handling
- password hashing with bcrypt
- JWT-based authentication
- reverse proxy routing with Nginx
- a path toward HTTPS/TLS deployment

## Project Layout

- backend: Express API, authentication, role routes, Prisma, and security middleware
- frontend: React app built with Vite
- nginx: reverse proxy configuration for production-style deployment

## How the app works today

### Local development

In local development, the frontend runs with Vite and uses the proxy in `frontend/vite.config.ts`.

That means requests starting with `/api` are forwarded to the backend on port `5000`.

So locally:

- frontend talks to Vite
- Vite proxies `/api` to the backend
- backend handles authentication and API logic

This is why Nginx is not required for day-to-day local development.

### Current Nginx usage

The Nginx config in `nginx/nginx.conf` is meant for deployment, especially inside Docker or a Linux server.

Its job is to:

- serve the built frontend files
- forward `/api` requests to the backend service
- handle HTTPS termination when certificates are available

In the current setup, Nginx is not the development proxy. It is the production reverse proxy layer.

## Reverse proxy flow

The request flow is:

1. The browser sends a request to Nginx.
2. Nginx decides whether the request is for the frontend or the backend.
3. Static frontend files are served directly by Nginx.
4. Requests beginning with `/api` are forwarded to the backend container or service.
5. The backend processes the request and returns a response.
6. Nginx sends the final response back to the browser.

## Why Nginx is used

Nginx is used here because it can:

- serve static files efficiently
- route traffic to different services
- terminate TLS/HTTPS in front of the backend
- keep the backend simpler by letting it run plain HTTP internally

## How to run locally

### Backend

From the backend folder:

```bash
npm run dev
```

### Frontend

From the frontend folder:

```bash
npm run dev
```

The Vite proxy will forward `/api` requests to `http://localhost:5000`.

## Docker and deployment plan

This project is intended to work with Docker where Nginx runs in a Linux container.

Typical production flow:

1. Build the frontend into static files.
2. Run the backend in a separate container.
3. Run Nginx in front of both services.
4. Use Nginx to route frontend and API traffic.

In Docker, service names matter. The current Nginx config uses `proxy_pass http://backend:5000`, which assumes the backend service is named `backend` in Compose.

## TLS setup

You already have TLS handled by Nginx in the current Docker setup.

Current setup:

- the backend runs on plain HTTP inside the container network
- Nginx terminates HTTPS
- the Nginx container mounts certificate files from `nginx/certs`
- the reverse proxy keeps the frontend and API on the same public origin

Right now, the certificates are local test certificates created with `mkcert`.

That means:

- local development and testing use Nginx HTTPS already
- production should still use certificates from a trusted source such as a certificate authority or an automated tool like Let’s Encrypt

So the part that is still "future" is not TLS in general, but **production-grade certificates**.

## Security notes

The project also includes the following security-related work:

- secrets are loaded from environment variables instead of hardcoded values
- passwords are hashed with bcrypt and salt
- JWT tokens are used for authentication
- the frontend uses relative API paths so proxy routing works in both dev and deployment

## Reference files

- `backend/server.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/middleware/auth.middleware.js`
- `frontend/vite.config.ts`
- `nginx/nginx.conf`
- `Visal Folder/A4.md`

## Short summary

Right now, the frontend uses Vite proxying for local development, while Nginx is reserved for deployment.

The long-term plan is to run the frontend build and backend service behind Nginx in Docker, with TLS handled at the proxy layer.