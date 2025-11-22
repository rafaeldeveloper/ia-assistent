# 📊 Dashboard Financeiro

Dashboard web para visualizar dados do Assistente de Finanças Pessoais.

## 🚀 Funcionalidades

- 📈 Visualização de receitas e despesas
- 📊 Gráficos interativos (Chart.js)
- 🏷️ Gastos por categoria
- 📅 Evolução mensal e diária
- 📋 Lista de transações
- 🔄 Filtros por período (semana, mês, ano, tudo)

## 📋 Pré-requisitos

- Node.js 18+
- Banco de dados SQLite do bot (mesma base de dados)

## 🔧 Instalação

1. Instale as dependências:
```bash
cd dashboard
npm install
```

2. Configure as variáveis de ambiente (opcional):
```bash
# Criar .env se necessário
DB_PATH=../data/finances.db
DASHBOARD_PORT=3000
```

## 🎯 Como Usar

1. Inicie o servidor:
```bash
npm start
```

2. Acesse no navegador:
```
http://localhost:3000
```

3. Selecione um usuário e período para visualizar os dados

## 🐳 Docker

O dashboard pode ser adicionado ao `docker-compose.yml`:

```yaml
dashboard:
  build: ./dashboard
  ports:
    - "3000:3000"
  volumes:
    - ./data:/app/data
  environment:
    - DB_PATH=/app/data/finances.db
    - DASHBOARD_PORT=3000
```

## 📡 API Endpoints

- `GET /api/users` - Lista todos os usuários
- `GET /api/summary/:userId` - Resumo financeiro
- `GET /api/transactions/:userId` - Lista de transações
- `GET /api/categories/:userId` - Gastos por categoria
- `GET /api/monthly/:userId` - Dados mensais
- `GET /api/daily/:userId` - Dados diários

## 🎨 Tecnologias

- **Backend**: Express.js, SQLite3
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Gráficos**: Chart.js
- **Estilo**: CSS moderno e responsivo

## 📱 Responsivo

O dashboard é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Mobile

## 🔐 Segurança

- O dashboard lê apenas dados do banco (não modifica)
- CORS habilitado para desenvolvimento
- Para produção, configure CORS adequadamente

