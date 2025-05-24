FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorios necesarios para uploads
RUN mkdir -p public/uploads/avatars

# Dar permisos necesarios
RUN chmod -R 777 public/uploads

EXPOSE 5000

CMD ["npm", "start"]