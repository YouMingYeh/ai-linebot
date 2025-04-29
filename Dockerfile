###########################
# Stage 1: Builder
###########################
FROM node:23-slim AS builder
WORKDIR /app

# Install openssl
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files & lockfile separately for caching
COPY package*.json* pnpm-lock.yaml* ./
# Copy Prisma schema to allow prepare script to run prisma generate
COPY prisma ./prisma/
# Install dependencies without running lifecycle scripts
RUN pnpm install --ignore-scripts

# Copy remaining source code
COPY . ./

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

###########################
# Stage 2: Production
###########################
FROM node:23-slim AS runner
WORKDIR /app

# Install openssl
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files and lockfile to install only production deps
COPY package*.json* pnpm-lock.yaml* ./
# Override postinstall and prepare scripts to no-op in production
RUN sed -i 's/"postinstall": ".*"/"postinstall": "echo skip postinstall in production"/; s/"prepare": ".*"/"prepare": "echo skip prepare in production"/' package.json
RUN pnpm install --prod

# Copy Prisma schema for potential migrations
COPY prisma ./prisma/

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 1234

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push && node dist/index.js"]