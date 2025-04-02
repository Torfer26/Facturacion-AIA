FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Capa de dependencias
FROM base AS deps
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci
RUN npm install @tanstack/react-table @radix-ui/react-slot @radix-ui/react-icons @radix-ui/react-toast class-variance-authority clsx tailwind-merge lucide-react

# Capa de build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generar Prisma Client
RUN npx prisma generate

# Build de la aplicación
RUN npm run build

# Capa de producción
FROM base AS runner
WORKDIR /app

# Variables de entorno para producción
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Establecer usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar la aplicación
CMD ["npm", "start"] 