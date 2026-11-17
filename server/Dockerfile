# Etapa 1: Builder para instalar dependencias de producción
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Etapa 2: Imagen Final Ultraligera
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Usuario no privilegiado para seguridad en Kubernetes
USER node

# Copiar dependencias y código
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node server.js package*.json ./
COPY --chown=node:node ../game ../game

EXPOSE 8080

# Healthcheck interno del contenedor
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

CMD ["node", "server.js"]
