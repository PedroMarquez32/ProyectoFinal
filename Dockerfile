# 1. Build frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 2. Build backend
FROM node:20-alpine as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# 3. Producción: servir frontend y backend juntos 
FROM node:20-alpine
WORKDIR /app

# Copia el backend
COPY --from=backend-build /app/backend ./

# Copia el frontend ya compilado al backend (asumiendo que el backend sirve estáticos desde /public o similar)
COPY --from=frontend-build /app/frontend/dist ./public

# Instala dependencias de producción del backend
RUN npm install --production

EXPOSE 5000

CMD ["node", "frontend/index.html"]