# Frontend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar codigo
COPY . .

# Build
RUN npm run build

# Expor porta
EXPOSE 3000

# Rodar em producao
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]