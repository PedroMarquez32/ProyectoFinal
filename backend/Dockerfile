FROM node:16

WORKDIR /usr/src/app

# Copy only package.json first
COPY package.json ./

# Clean install dependencies
RUN npm install

# Create uploads directory if needed
RUN mkdir -p public/uploads && chmod -R 777 public

# Copy the rest of the application code
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]