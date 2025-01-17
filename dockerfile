# Etapa de construcción
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar los archivos construidos
COPY --from=build /app/dist ./dist

# Exponer el puerto
EXPOSE 8080

# Comando para servir la aplicación
CMD ["serve", "-s", "dist", "-l", "8080"] 