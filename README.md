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
├── data/                  # Banco de dados SQLite (criado automaticamente)
├── temp/                  # Arquivos temporários de áudio (criado automaticamente)
├── .env                   # Variáveis de ambiente (criar manualmente)
├── package.json
└── README.md
```

## 🔐 Segurança

- O banco de dados é local e armazenado em `data/finances.db`
- Cada usuário tem seus próprios dados isolados
- As credenciais do WhatsApp são armazenadas localmente em `.wwebjs_auth/`

## 🛠️ Desenvolvimento

Para executar em modo de desenvolvimento com auto-reload:
```bash
npm run dev
```

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

