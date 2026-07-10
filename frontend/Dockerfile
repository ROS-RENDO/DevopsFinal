# Stage 1: Build Environment
FROM node:24-alpine AS builder

WORKDIR /app

# Leverage Docker caching for dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build the React application
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.27-alpine

# Copy compiled static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
