# Stage 1: Build Environment
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Leverage Docker caching for dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Build the TypeScript code
COPY . .
RUN npm run build

# Stage 2: Secure Production Environment
FROM node:24-alpine

WORKDIR /usr/src/app

# Run as non-root user for security (SonarCloud Best Practice)
USER node

# Combine COPY instructions into a single layer to reduce image bloat
COPY --from=builder --chown=node:node \
    /usr/src/app/package*.json \
    /usr/src/app/node_modules \
    /usr/src/app/dist \
    /usr/src/app/prisma \
    ./

EXPOSE 3000

CMD [ "npm", "start" ]
