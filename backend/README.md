# Backend Docker Run Guide

This backend runs with Node.js, Prisma, SQLite, and Nginx. The Docker setup is designed so you can start the backend and reverse proxy together with one command and keep the database data persistent with a Docker volume.

## What is included

- `Dockerfile` - builds the backend image
- `docker-compose.yml` - runs the backend container and the Nginx reverse proxy
- `.dockerignore` - keeps secrets and local files out of the image
- `.env` - runtime environment values such as `JWT_SECRET`

## Prerequisites

Make sure these are installed on your machine:

- Docker Desktop
- Docker Compose

## Important environment variables

Your backend reads values from `.env` at runtime.

Example `.env` values:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-strong-random-secret"
```

For Docker, the compose file overrides `DATABASE_URL` so the SQLite file is stored inside the container volume:

```env
DATABASE_URL=file:/app/data/dev.db
```

## How to run the backend with Docker

1. Open a terminal in the `backend` folder.

```powershell
cd "C:\Users\Yup 2\Documents\Camtech\DevSec_Final\DevopsFinal\backend"
```

2. Make sure your `.env` file exists and contains a valid `JWT_SECRET`.

3. Build the frontend first, because Nginx serves the built files from `frontend/dist`.

```powershell
cd "C:\Users\Yup 2\Documents\Camtech\DevSec_Final\DevopsFinal\frontend"
npm run build
```

4. Build and start the containers.

```powershell
docker compose up --build
```

5. Open another terminal if you want to see the logs.

```powershell
docker compose logs -f
```

## How to test it

After the containers start, open:

- `http://localhost:5000/health`
- `http://localhost` to test the Nginx redirect
- `https://localhost` to test the frontend through Nginx

You should see a JSON response like:

```json
{
  "status": "OK",
  "message": "Auth service is running"
}
```

You can also test:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` after login

## Why the database volume is used

This backend uses SQLite, so the database is a file.

The compose file mounts a Docker volume at:

```text
/app/data
```

The SQLite database file is stored at:

```text
/app/data/dev.db
```

This matters because it keeps your data even if the container is stopped or removed.

## How to stop the container

```powershell
docker compose down
```

If you also want to remove the stored volume data:

```powershell
docker compose down -v
```

## Notes

- Do not put real secrets directly in source code.
- Keep `.env` out of git.
- If you change Prisma schema files, rebuild the container with `docker compose up --build`.

## Files related to Docker

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env`
- `prisma/schema.prisma`
- `server.js`
- `../nginx/nginx.conf`
- `../frontend/dist`
