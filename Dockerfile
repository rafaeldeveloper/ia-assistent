# Use Node.js LTS como imagem base
FROM node:18-slim

# Instalar dependências do sistema necessárias para Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
# npm ci é mais rápido e determinístico quando package-lock.json está sincronizado
RUN npm ci --omit=dev || (npm install --omit=dev --legacy-peer-deps && npm cache clean --force)

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p data temp .wwebjs_auth .wwebjs_cache

# Definir variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PREVENT_LOOP=true

# Expor porta (se necessário no futuro)
# EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/index.js"]

