# Build stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Limpiar la caché de npm y node_modules
RUN rm -rf node_modules package-lock.json && \
    npm cache clean --force

# Instalar todas las dependencias necesarias
RUN npm install && \
    npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Development command
CMD ["npm", "run", "dev", "--", "--host"]

FROM node:18-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Development command
CMD ["npm", "run", "dev", "--", "--host"] 