FROM node:20-slim AS builder

ARG DATABASE_PUBLIC_URL="postgresql://postgres:xEumdkidBTSCqwakEWRedVvxvlYPxQgI@:/railway"
ARG DATABASE_URL="postgresql://postgres:xEumdkidBTSCqwakEWRedVvxvlYPxQgI@postgres.railway.internal:5432/railway"

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl chromium fonts-liberation ca-certificates && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV DATABASE_PUBLIC_URL=$DATABASE_PUBLIC_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN chmod +x node_modules/.bin/* && ./node_modules/.bin/prisma generate && npm run build

FROM node:20-slim AS runner

ARG DATABASE_PUBLIC_URL="postgresql://postgres:xEumdkidBTSCqwakEWRedVvxvlYPxQgI@:/railway"
ARG DATABASE_URL="postgresql://postgres:xEumdkidBTSCqwakEWRedVvxvlYPxQgI@postgres.railway.internal:5432/railway"

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl chromium fonts-liberation ca-certificates && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV DATABASE_PUBLIC_URL=$DATABASE_PUBLIC_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

CMD ["sh", "-c", "./node_modules/.bin/prisma generate && ./node_modules/.bin/prisma migrate deploy || true && npm run prisma:seed || true && node dist/server.js"]
