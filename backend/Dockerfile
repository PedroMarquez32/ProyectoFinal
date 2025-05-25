FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias incluyendo Stripe
RUN npm install && \
    npm install stripe

# Copiar el resto del código
COPY . .

# Crear directorios necesarios
RUN mkdir -p public/uploads

EXPOSE 5000

CMD ["npm", "start"]