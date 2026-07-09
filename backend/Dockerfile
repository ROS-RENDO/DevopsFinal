# Multi-stage build for Node.js + Prisma

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

# Install OpenSSL (required for Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev deps for prisma generate)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Stage 2: Production
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

# Only copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src ./src
# We also copy scripts in case they need to generate certs on boot, but ideally certs are handled by a reverse proxy
COPY --from=builder /app/scripts ./scripts

# Ensure the database file has correct permissions if it exists
RUN mkdir -p /app/data && chown -R node:node /app/data
ENV DATABASE_URL="file:/app/data/dev.db"

# Expose port
EXPOSE 5000

# Run as non-root user for security
USER node

# Start the application
CMD ["npm", "run", "dev"]
