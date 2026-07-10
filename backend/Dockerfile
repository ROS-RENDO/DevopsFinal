# Stage 1: Build Environment
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Leverage Docker caching for dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Generate Prisma Client (we purposefully don't copy prisma.config.ts here so it doesn't require env vars during build)
COPY prisma ./prisma/
RUN npx prisma generate

# Build the TypeScript code
COPY . .
RUN npm run build

# Prepare a clean release bundle so we can use a single COPY instruction later
RUN mkdir /release && \
    cp -a package*.json node_modules dist prisma prisma.config.ts /release/

# Stage 2: Secure Production Environment
FROM node:24-alpine

WORKDIR /usr/src/app

# Run as non-root user for security (SonarCloud Best Practice)
USER node

# Combine COPY instructions into a single layer by copying the prepared release bundle
COPY --from=builder --chown=node:node /release ./

EXPOSE 3000

CMD [ "npm", "start" ]
