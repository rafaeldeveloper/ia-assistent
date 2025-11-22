FROM node:18-slim

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev || (npm install --omit=dev --legacy-peer-deps && npm cache clean --force)

# Copiar código
COPY . .

# Criar diretório de dados se não existir
RUN mkdir -p data

# Expor porta
EXPOSE 3002

# Comando para iniciar
CMD ["node", "server.js"]

