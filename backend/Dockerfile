FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY tests ./tests
COPY server.js ./
COPY prisma.config.ts ./

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL=file:/app/data/dev.db

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["npm", "start"]