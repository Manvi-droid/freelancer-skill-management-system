# ==============================================================================
# AWS Free Tier Optimized Multi-Stage Dockerfile for FSMS
# Designed to run comfortably within 1GB RAM on AWS EC2 t2.micro / t3.micro
# ==============================================================================

# STAGE 1: Build Frontend SPA
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Copy package files and install
COPY client/package*.json ./
RUN npm ci

# Copy client source and build production bundle
COPY client/ ./
RUN npm run build

# STAGE 2: Lightweight Production Server Runtime (<150MB footprint)
FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./server

# Copy built frontend assets from Stage 1 into server-accessible client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Create persistent directories for SQLite database and uploads
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app

# Run as non-privileged node user for security compliance (SRS S3)
USER node

# Expose HTTP port
EXPOSE 5000

# Container healthcheck for AWS ALB / Route 53 / ECS health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the unified FSMS server
CMD ["node", "server/server.js"]
