FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# Instalar dependências de desenvolvimento e o esbuild
RUN npm ci --include=dev && npm install esbuild@0.18.20 --force

# Instalar o Vite globalmente
RUN npm install -g vite

COPY . .

# Rodar o build com o Vite
RUN vite build

EXPOSE 3000

CMD ["npm", "run", "dev"]
