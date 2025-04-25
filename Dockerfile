# syntax=docker/dockerfile:1

# ---- Builder ----
# Default to Node 22 LTS; override with `--build-arg NODE_VERSION=xx-alpine`
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Enable Corepack and install pnpm
# (Corepack is shipped with Node >=16; for older images you can `npm install -g pnpm`)
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source & build
COPY . .

RUN pnpm build

# ---- Runner ----
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# Copy the built artifacts.
COPY --from=builder /app/dist ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/entrypoint.sh ./
COPY --from=builder /app/prisma ./prisma

RUN chmod +x /app/entrypoint.sh

# Add pnpm because it is used in the entrypoint
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set production env & expose port
ENV NODE_ENV=production
EXPOSE 3000

# Run with node
ENTRYPOINT [ "/app/entrypoint.sh" ]
CMD [ "node", "index.js" ]
