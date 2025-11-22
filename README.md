# 💰 Assistente de Finanças Pessoais para WhatsApp

Um bot inteligente para WhatsApp que ajuda você a organizar suas finanças pessoais registrando gastos e receitas através de mensagens simples.

## 🚀 Funcionalidades

- ✅ Registro de gastos e receitas através de mensagens naturais
- ✅ Suporte a mensagens de áudio (voice notes) com transcrição automática
- ✅ Processamento inteligente de mensagens (com ou sem IA)
- ✅ Armazenamento de transações em banco de dados SQLite
- ✅ Geração de relatórios financeiros (semanal, mensal, por período)
- ✅ Listagem de gastos recentes
- ✅ Categorização automática de transações
- ✅ Suporte a múltiplos usuários
- ✅ Landing page moderna para apresentação do projeto

## 📋 Pré-requisitos

- Node.js 18+ instalado
- WhatsApp instalado no celular
- (Obrigatório para áudio) Chave da API OpenAI para transcrição de áudio
- (Opcional) Chave da API OpenAI para processamento mais inteligente de texto

## 🔧 Instalação

1. Clone ou baixe este repositório

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da OpenAI (opcional, mas recomendado):
```
OPENAI_API_KEY=sua_chave_aqui
```

## 🎯 Como Usar

1. Inicie o bot:
```bash
npm start
```

2. Escaneie o QR Code que aparecerá no terminal com seu WhatsApp

3. Envie mensagens descrevendo seus gastos e receitas:
   - **Texto**: "Gastei R$ 50 no supermercado"
   - **Texto**: "Recebi R$ 1000 de salário"
   - **Texto**: "Almoço R$ 25"
   - **Texto**: "Paguei R$ 200 de conta de luz"
   - **Áudio**: Envie uma mensagem de voz (voice note) descrevendo sua transação

4. Use os comandos disponíveis:
   - `/ajuda` - Mostra ajuda
   - `/relatorio` - Relatório do mês atual
   - `/relatorio semana` - Relatório da semana
   - `/relatorio 2024-01` - Relatório de um mês específico
   - `/gastos` - Lista os últimos 10 gastos

## 📊 Exemplos de Mensagens

### Registrando Gastos:
- "Gastei R$ 50 no supermercado"
- "Almoço R$ 25"
- "Paguei R$ 200 de conta de luz"
- "Uber R$ 15"

### Registrando Receitas:
- "Recebi R$ 1000 de salário"
- "Ganhei R$ 500 de freela"
- "Entrada de R$ 2000"

## 🗂️ Estrutura do Projeto

```
ia-finance-assistent/
├── src/
│   ├── index.js           # Arquivo principal do bot
│   ├── database.js        # Gerenciamento do banco de dados
│   ├── messageProcessor.js # Processamento de mensagens
│   ├── audioProcessor.js  # Processamento de áudio (transcrição)
│   └── reportGenerator.js  # Geração de relatórios
├── docs/                  # Landing page (GitHub Pages)
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos
│   ├── script.js          # JavaScript
│   └── README.md          # Instruções de deploy
├── data/                  # Banco de dados SQLite (criado automaticamente)
├── temp/                  # Arquivos temporários de áudio (criado automaticamente)
├── .env                   # Variáveis de ambiente (criar manualmente)
├── Dockerfile             # Configuração da imagem Docker
├── docker-compose.yml     # Orquestração dos containers
├── deploy.sh              # Script de deploy automatizado
├── env.docker.example     # Exemplo de variáveis de ambiente para Docker
├── package.json
└── README.md
```

## 🔐 Segurança

- O banco de dados é local e armazenado em `data/finances.db`
- Cada usuário tem seus próprios dados isolados
- As credenciais do WhatsApp são armazenadas localmente em `.wwebjs_auth/`

## 🌐 Landing Page

O projeto inclui uma landing page moderna hospedada no GitHub Pages.

- **Ver landing page**: [https://seu-usuario.github.io/ia-finance-assistent/](https://seu-usuario.github.io/ia-finance-assistent/)
- **Instruções de deploy**: Veja `docs/README.md` e `docs/SETUP.md`

### Personalizar antes do deploy:

1. Abra `docs/index.html`
2. Substitua `seu-usuario` pelo seu usuário do GitHub em todos os links
3. Siga as instruções em `docs/SETUP.md`

## 🛠️ Desenvolvimento

Para executar em modo de desenvolvimento com auto-reload:
```bash
npm run dev
```

## 🐳 Deploy com Docker (AWS EC2)

### Pré-requisitos
- Instância EC2 com Ubuntu/Debian
- Acesso SSH à instância
- Porta 22 (SSH) aberta no Security Group

### Deploy Rápido

1. **Conecte-se à instância EC2:**
```bash
ssh -i sua-chave.pem ubuntu@seu-ip-ec2
```

2. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd ia-finance-assistent
```

3. **Configure as variáveis de ambiente:**
```bash
cp env.docker.example .env
nano .env  # Edite e adicione sua OPENAI_API_KEY
```

4. **Execute o script de deploy:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Deploy Manual

1. **Instalar Docker e Docker Compose:**
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Construir e iniciar:**
```bash
docker-compose build
docker-compose up -d
```

3. **Ver logs:**
```bash
docker-compose logs -f
```

### Comandos Úteis

```bash
# Parar o container
docker-compose down

# Reiniciar o container
docker-compose restart

# Ver logs em tempo real
docker-compose logs -f

# Entrar no container
docker-compose exec finance-assistant sh

# Reconstruir após mudanças
docker-compose build --no-cache
docker-compose up -d
```

### Estrutura Docker

```
ia-finance-assistent/
├── Dockerfile              # Configuração da imagem Docker
├── docker-compose.yml      # Orquestração dos containers
├── .dockerignore          # Arquivos ignorados no build
├── deploy.sh              # Script de deploy automatizado
└── env.docker.example     # Exemplo de variáveis de ambiente
```

### Volumes Persistentes

Os seguintes diretórios são persistidos como volumes:
- `./data` - Banco de dados SQLite
- `./.wwebjs_auth` - Autenticação do WhatsApp
- `./.wwebjs_cache` - Cache do WhatsApp
- `./temp` - Arquivos temporários de áudio

### Notas Importantes

- **QR Code**: Na primeira execução, você precisará escanear o QR Code. Use `docker-compose logs` para ver o QR Code no terminal.
- **Persistência**: Os dados são salvos nos volumes, então mesmo reiniciando o container, seus dados permanecem.
- **Recursos**: O container precisa de pelo menos 2GB de RAM e 1GB de espaço em disco.
- **Rede**: Por padrão, não expõe portas. Se precisar expor alguma porta no futuro, edite o `docker-compose.yml`.

## 📝 Notas

- O bot funciona melhor com a API da OpenAI configurada, mas também funciona sem ela usando processamento básico
- **Transcrição de áudio requer OpenAI API Key** (usa Whisper API)
- O banco de dados é criado automaticamente na primeira execução
- Os dados são armazenados localmente no seu computador
- Arquivos de áudio temporários são criados e removidos automaticamente durante a transcrição

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou pull requests!

## 📄 Licença

MIT

