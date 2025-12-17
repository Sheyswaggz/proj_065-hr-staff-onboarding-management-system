# syntax=docker/dockerfile:1.5

# ============================================================================
# Build Stage - Frontend
# ============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY frontend/ ./
RUN npm run build

# ============================================================================
# Build Stage - Backend
# ============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

RUN apk add --no-cache openssl

COPY backend/package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY backend/ ./
RUN npx prisma generate && \
    npm run build

# ============================================================================
# Runtime Stage
# ============================================================================
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    tini \
    curl \
    && addgroup -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs appuser

COPY --from=backend-builder --chown=appuser:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/package.json ./backend/
COPY --from=backend-builder --chown=appuser:nodejs /app/backend/prisma ./backend/prisma

COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder --chown=appuser:nodejs /app/frontend/package.json ./frontend/

ENV NODE_ENV=production \
    PORT=8080 \
    FRONTEND_PORT=3000 \
    PATH=/app/backend/node_modules/.bin:$PATH

USER appuser

EXPOSE 8080 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["tini", "--"]

CMD ["node", "backend/dist/index.js"]