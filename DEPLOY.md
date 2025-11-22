# 🚀 Guia de Deploy - AWS EC2

Este guia detalha o processo de deploy do Assistente de Finanças no AWS EC2 usando Docker.

## 📋 Pré-requisitos

1. Conta AWS ativa
2. Instância EC2 criada (recomendado: Ubuntu 22.04 LTS)
3. Security Group configurado com:
   - Porta 22 (SSH) aberta
   - Outras portas conforme necessário
4. Chave SSH para acesso à instância
5. OpenAI API Key (para transcrição de áudio)

## 🔧 Configuração Inicial da EC2

### 1. Conectar à Instância

```bash
ssh -i sua-chave.pem ubuntu@seu-ip-ec2
```

### 2. Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Instalar Git (se necessário)

```bash
sudo apt install git -y
```

## 📦 Deploy da Aplicação

### Opção 1: Deploy Automatizado (Recomendado)

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd ia-finance-assistent
```

2. **Configure as variáveis de ambiente:**
```bash
cp env.docker.example .env
nano .env
```

Edite o arquivo `.env` e adicione:
```
OPENAI_API_KEY=sua_chave_openai_aqui
DB_PATH=/app/data/finances.db
PREVENT_LOOP=true
NODE_ENV=production
```

3. **Execute o script de deploy:**
```bash
chmod +x deploy.sh
./deploy.sh
```

O script irá:
- Verificar/instalar Docker e Docker Compose
- Parar containers existentes
- Construir a imagem
- Criar diretórios necessários
- Iniciar o container

### Opção 2: Deploy Manual

1. **Instalar Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Instalar Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clone e configure:**
```bash
git clone <seu-repositorio>
cd ia-finance-assistent
cp env.docker.example .env
nano .env  # Configure suas variáveis
```

4. **Construir e iniciar:**
```bash
docker-compose build
docker-compose up -d
```

## 🔍 Verificar Status

### Ver logs em tempo real:
```bash
docker-compose logs -f
```

### Ver status dos containers:
```bash
docker-compose ps
```

### Ver QR Code (primeira execução):
```bash
docker-compose logs | grep -A 20 "QR Code"
```

## 🛠️ Comandos Úteis

### Gerenciamento do Container

```bash
# Parar o container
docker-compose down

# Reiniciar o container
docker-compose restart

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reconstruir após mudanças no código
docker-compose build --no-cache
docker-compose up -d
```

### Logs e Debug

```bash
# Ver últimos logs
docker-compose logs --tail=100

# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do serviço
docker-compose logs finance-assistant

# Entrar no container
docker-compose exec finance-assistant sh
```

### Backup

```bash
# Fazer backup do banco de dados
docker-compose exec finance-assistant cp /app/data/finances.db /app/data/finances.db.backup

# Ou copiar para o host
docker cp finance-assistant:/app/data/finances.db ./backup/
```

## 🔄 Atualização

Para atualizar a aplicação:

```bash
# 1. Parar o container
docker-compose down

# 2. Atualizar código
git pull

# 3. Reconstruir e reiniciar
docker-compose build --no-cache
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs de erro
docker-compose logs

# Verificar se portas estão em uso
sudo netstat -tulpn | grep :3000

# Verificar recursos do sistema
free -h
df -h
```

### QR Code não aparece

```bash
# Verificar logs completos
docker-compose logs -f | grep -i qr

# Verificar se autenticação existe
ls -la .wwebjs_auth/
```

### Problemas de permissão

```bash
# Ajustar permissões dos diretórios
sudo chown -R $USER:$USER data/ temp/ .wwebjs_auth/ .wwebjs_cache/
```

### Container reinicia constantemente

```bash
# Verificar logs de erro
docker-compose logs --tail=50

# Verificar recursos disponíveis
docker stats
```

## 📊 Monitoramento

### Recursos do Sistema

```bash
# Uso de CPU e memória do container
docker stats finance-assistant

# Espaço em disco
df -h

# Uso de memória
free -h
```

### Logs do Sistema

```bash
# Logs do Docker
sudo journalctl -u docker.service

# Logs do sistema
sudo journalctl -xe
```

## 🔐 Segurança

1. **Firewall**: Configure Security Groups adequadamente
2. **SSH**: Use chaves SSH, não senhas
3. **Variáveis de Ambiente**: Nunca commite o arquivo `.env`
4. **Updates**: Mantenha o sistema e Docker atualizados
5. **Backups**: Faça backups regulares do banco de dados

## 💰 Custos Estimados

- **EC2 t3.micro**: ~$7-10/mês (Free Tier: 750h/mês)
- **OpenAI Whisper**: ~$0.006/minuto de áudio
- **Armazenamento EBS**: ~$0.10/GB/mês

## 📝 Notas Importantes

- O QR Code aparece apenas na primeira execução
- Após escanear o QR Code, a autenticação fica salva em `.wwebjs_auth/`
- Os dados são persistidos nos volumes Docker
- O container precisa de pelo menos 2GB de RAM
- Para produção, considere usar um processo manager como PM2 ou systemd

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Verifique recursos: `docker stats`
3. Verifique configuração: `cat .env`
4. Consulte a documentação do Docker e whatsapp-web.js

