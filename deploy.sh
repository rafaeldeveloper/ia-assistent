#!/bin/bash

# Script de deploy para AWS EC2
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy do Assistente de Finanças..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker instalado. Por favor, faça logout e login novamente."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down || true

# Construir imagem
echo "🔨 Construindo imagem Docker..."
docker-compose build --no-cache

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p data temp .wwebjs_auth .wwebjs_cache

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando .env a partir do exemplo..."
    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env
        echo "✅ Arquivo .env criado. Por favor, edite e configure suas variáveis de ambiente."
        echo "   Especialmente importante: OPENAI_API_KEY"
        exit 1
    else
        echo "❌ Arquivo .env.docker.example não encontrado!"
        exit 1
    fi
fi

# Iniciar containers
echo "🚀 Iniciando containers..."
docker-compose up -d

# Mostrar logs
echo "📋 Logs do container (Ctrl+C para sair):"
docker-compose logs -f

