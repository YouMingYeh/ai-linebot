###########################
# Stage 1: Builder
###########################
FROM node:23-slim AS builder
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Setup pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files & Prisma schema for dependency installation
COPY package*.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/
RUN pnpm install --ignore-scripts

# Copy source code and build application
COPY . ./
RUN pnpm prisma generate
RUN pnpm build

###########################
# Stage 2: Production
###########################
FROM node:23-slim AS runner
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Setup pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Install production dependencies only
COPY package*.json* pnpm-lock.yaml* ./
RUN sed -i 's/"postinstall": ".*"/"postinstall": "echo skip postinstall in production"/; s/"prepare": ".*"/"prepare": "echo skip prepare in production"/' package.json
RUN pnpm install --prod

# Copy Prisma schema and built files
COPY prisma ./prisma/
COPY --from=builder /app/dist ./dist

EXPOSE 1234

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push && node dist/index.js"]