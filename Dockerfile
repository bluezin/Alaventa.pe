# syntax=docker/dockerfile:1.6

# ============================================================================
# Builder stage: install deps and build the api-server
# ============================================================================
FROM node:20-bookworm-slim AS builder

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile --ignore-scripts \
 && pnpm rebuild \
 && pnpm --filter @workspace/api-server build

# ============================================================================
# Runtime stage: smaller image with only what we need to run
# ============================================================================
FROM node:20-bookworm-slim AS runner

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app

COPY --from=builder /app /app

ENV NODE_ENV=production

CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
