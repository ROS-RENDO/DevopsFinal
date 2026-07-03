# README: Nginx HTTPS Setup and Repository Cleanup

This file explains what we changed in the project and why.

## What this work is about

The goal of this work was to make the deployment setup clearer and safer.

We focused on three things:

1. Keeping local TLS certificate files out of GitHub.
2. Clarifying what Nginx actually does in this project.
3. Recording the changes in a simple README-style report.

## What we did

### 1. Added certificate files to `.gitignore`

We updated the root [`.gitignore`](../.gitignore) so generated certificate files in `nginx/certs/` are ignored.

The rule added is:
- `nginx/certs/*.pem`

This keeps files like:
- `nginx/certs/cert.pem`
- `nginx/certs/key.pem`

out of source control.

Why this matters:
- `key.pem` is a private key and must not be committed
- generated TLS files are environment-specific
- the repo stays cleaner and safer for sharing on GitHub

### 2. Confirmed Nginx is not a load balancer here

We checked the Nginx configuration in [nginx/nginx.conf](../nginx/nginx.conf).

In this project, Nginx does these jobs:
- redirects HTTP traffic to HTTPS
- terminates TLS using the certificate files from `nginx/certs/`
- serves the frontend static build
- forwards `/api/` requests to the backend service

It is not load balancing in the current setup because there is only one backend service target:
- `proxy_pass http://backend:5000;`

Simple meaning:
- Nginx is the secure front door
- the backend is just the app server behind it
- there are no multiple upstream backend servers to balance across

### 3. Verified the Docker setup matches the proxy design

We reviewed [backend/docker-compose.yml](../backend/docker-compose.yml).

That file shows how the pieces connect:
- backend runs on port `5000`
- Nginx exposes ports `80` and `443`
- Nginx mounts the frontend build and certificate files
- Nginx proxies API requests to the backend container

This matches a standard reverse-proxy deployment pattern.

### 4. Kept the documentation aligned with the code

We also clarified the project documentation so the Nginx role is described correctly.

That means the docs now reflect that Nginx is used for:
- HTTPS termination
- HTTP to HTTPS redirect
- reverse proxying for the backend

## What the final setup looks like

1. A browser opens the app over HTTP or HTTPS.
2. Nginx redirects HTTP to HTTPS.
3. Nginx uses the local certificate files to serve the site securely.
4. Static frontend files are served from the Nginx container.
5. API requests under `/api/` are forwarded to the backend.
6. The backend handles the application logic and returns the response.

## Why this is better

This setup is better because:
- private key files stay out of Git history
- the HTTPS role is clearly handled by Nginx
- the backend stays simpler
- the deployment is easier to understand and maintain

## Short summary

In this task, we cleaned up the repo by ignoring generated TLS files and confirmed that Nginx is acting as an HTTPS terminator and reverse proxy, not as a load balancer.
