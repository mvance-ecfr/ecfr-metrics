# Stage 1: Build the app
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install deps for entire monorepo
RUN npm ci

# Copy everything else
COPY . .

# Build the workspace (adjust target if needed)
RUN npx nx build scheduler --no-cloud && npx nx build worker --no-cloud && npx nx build api --no-cloud && npx nx build frontend --no-cloud

# Stage 2: Slim runtime image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Only copy what's needed: built app + node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/scheduler ./dist/scheduler
COPY --from=builder /app/dist/worker ./dist/worker
COPY --from=builder /app/dist/api ./dist/api
COPY --from=builder /app/dist/frontend ./dist/frontend

# Default to running worker — override with CMD in Cloud Run Job
CMD ["node", "dist/worker/main.js"]
