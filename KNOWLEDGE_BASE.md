# 📚 Base de Conhecimento - Práticas e Cuidados

Este documento contém todas as práticas, aprendizados e cuidados desenvolvidos durante o projeto do Assistente de Finanças.

## 🎯 Boas Práticas Desenvolvidas

### 1. Estrutura de Projeto

```
projeto/
├── src/              # Código fonte
├── docs/             # Documentação e landing pages
├── data/             # Dados persistentes (gitignored)
├── temp/             # Arquivos temporários (gitignored)
├── .github/          # GitHub Actions e workflows
├── Dockerfile        # Containerização
├── docker-compose.yml
└── README.md         # Documentação principal
```

**Princípios:**
- Separar código fonte de documentação
- Usar `.gitignore` para dados sensíveis e temporários
- Manter estrutura organizada e escalável

### 2. Tratamento de Erros

**Sempre implementar:**
- Try-catch em operações assíncronas
- Logs detalhados para debug
- Mensagens de erro amigáveis ao usuário
- Fallbacks quando possível

**Exemplo:**
```javascript
try {
    await operation();
} catch (error) {
    console.error('Erro detalhado:', error);
    console.error('Stack:', error.stack);
    await userFriendlyMessage();
}
```

### 3. Prevenção de Loops

**Problema comum:** Bot processando suas próprias respostas

**Solução implementada:**
- Cache de mensagens processadas
- Verificação de padrões de resposta do bot
- Separação de eventos (message vs message_create)
- Marcação de mensagens apenas após processamento bem-sucedido

**Código padrão:**
```javascript
// Marcar apenas após sucesso
if (sucesso) {
    this.markMessageAsProcessed(message);
}
```

### 4. Processamento de Mensagens

**Ordem de verificação:**
1. Tipo de mensagem (status, protocol, etc.)
2. Mensagens próprias vs de outros usuários
3. Verificação de loop (cache)
4. Processamento específico (áudio, texto, comandos)
5. Marcação como processada

### 5. Integração com APIs Externas

**OpenAI API:**
- Sempre ter fallback quando API não disponível
- Tratamento de erros específicos
- Logs para debug
- Timeout e retry quando apropriado

**Padrão:**
```javascript
if (this.useAI) {
    try {
        return await this.processWithAI();
    } catch (error) {
        console.error('Erro IA:', error);
        return await this.processBasic(); // Fallback
    }
}
```

### 6. Docker e Deploy

**Dockerfile:**
- Usar imagens oficiais (node:18-slim)
- Instalar dependências do sistema necessárias
- Multi-stage builds quando apropriado
- Limpar cache após instalação
- Usar `npm ci` com fallback para `npm install`

**docker-compose.yml:**
- Volumes para dados persistentes
- Variáveis de ambiente
- Restart policies
- Health checks quando necessário

**Deploy:**
- Scripts automatizados (deploy.sh)
- Documentação clara
- Variáveis de ambiente seguras
- Backup de dados importantes

### 7. GitHub Pages

**Configuração inicial:**
1. Sempre habilitar manualmente primeiro
2. Depois mudar para GitHub Actions
3. Verificar permissões do workflow
4. Testar localmente antes de deploy

**Workflow:**
- Usar `continue-on-error` em passos opcionais
- Verificar paths corretos
- Configurar concurrency para evitar conflitos

### 8. Banco de Dados

**SQLite:**
- Criar índices para queries frequentes
- Usar transações quando apropriado
- Fechar conexões adequadamente
- Backup regular de dados importantes

**Padrão:**
```javascript
// Índices para performance
CREATE INDEX idx_user_date ON transactions(user_id, date);
CREATE INDEX idx_user_type ON transactions(user_id, type);
```

### 9. Logs e Debug

**Sempre incluir:**
- Logs informativos (✅, ⚠️, ❌)
- Timestamps quando relevante
- Contexto suficiente para debug
- Níveis apropriados (info, warn, error)

**Padrão:**
```javascript
console.log('📨 Mensagem recebida!');
console.log('From:', message.from);
console.log('Type:', message.type);
```

### 10. Segurança

**Variáveis de ambiente:**
- Nunca commitar `.env`
- Usar `.env.example` como template
- Validar variáveis obrigatórias na inicialização

**Dados sensíveis:**
- Autenticação do WhatsApp em `.wwebjs_auth/` (gitignored)
- API keys apenas em variáveis de ambiente
- Banco de dados local (não expor)

### 11. Processamento de Áudio

**Whisper API:**
- Verificar mimetype antes de processar
- Limpar arquivos temporários sempre
- Tratamento de erros robusto
- Fallback quando API não disponível

**Padrão:**
```javascript
try {
    // Processar áudio
    const transcription = await transcribe();
    return transcription;
} finally {
    // Sempre limpar arquivos temporários
    fs.unlinkSync(tempFile);
}
```

### 12. Mensagens Próprias (fromMe)

**Problema:** Bot processando suas próprias mensagens

**Solução:**
- Separar eventos `message` e `message_create`
- Verificar padrões de resposta automática
- Ignorar mensagens sem corpo quando fromMe
- Processar apenas mensagens próprias intencionais

### 13. Código Modular

**Organização:**
- Classes separadas por responsabilidade
- Database, MessageProcessor, AudioProcessor, ReportGenerator
- Fácil de testar e manter
- Reutilização de código

### 14. Documentação

**Sempre incluir:**
- README.md principal
- Comentários no código
- Documentação de APIs
- Guias de setup e deploy
- Troubleshooting comum

### 15. Git e Versionamento

**Commits:**
- Mensagens descritivas
- Commits atômicos
- Não commitar dados sensíveis
- `.gitignore` bem configurado

## ⚠️ Cuidados Importantes

### 1. WhatsApp Web.js

**Problemas comuns:**
- Importação CommonJS vs ES Modules
- Mensagens duplicadas
- QR Code expira
- Autenticação perdida

**Soluções:**
- Usar `createRequire` para CommonJS
- Prevenir loops com cache
- Reautenticação automática quando possível
- Backup de `.wwebjs_auth/`

### 2. Processamento de Mensagens

**Cuidados:**
- Não processar mensagens de status
- Ignorar respostas próprias do bot
- Validar tipo de mensagem antes de processar
- Timeout em operações longas

### 3. Docker

**Problemas comuns:**
- package-lock.json desatualizado
- Permissões de arquivos
- Volumes não montados corretamente
- Recursos insuficientes

**Soluções:**
- Atualizar lock file antes do build
- Verificar permissões de volumes
- Ajustar recursos (RAM, CPU)
- Usar `--no-cache` quando necessário

### 4. GitHub Pages

**Problemas comuns:**
- Pages não habilitado
- Workflow sem permissões
- Paths incorretos
- Cache do navegador

**Soluções:**
- Sempre habilitar manualmente primeiro
- Verificar permissões do workflow
- Testar paths localmente
- Limpar cache após deploy

### 5. APIs Externas

**Cuidados:**
- Rate limits
- Custos (OpenAI)
- Timeout e retry
- Fallback sempre disponível

## 🔧 Padrões de Código

### 1. Classes ES6

```javascript
export class MyClass {
    constructor() {
        this.property = value;
    }
    
    async method() {
        try {
            // código
        } catch (error) {
            // tratamento
        }
    }
}
```

### 2. Async/Await

```javascript
async function process() {
    try {
        const result = await operation();
        return result;
    } catch (error) {
        console.error('Erro:', error);
        throw error; // ou retornar fallback
    }
}
```

### 3. Error Handling

```javascript
try {
    await riskyOperation();
} catch (error) {
    console.error('Context:', context);
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    // Fallback ou notificação
}
```

### 4. Logging

```javascript
console.log('✅ Sucesso');
console.log('⚠️ Aviso');
console.error('❌ Erro');
console.log('📨 Mensagem recebida');
console.log('🔍 Processando...');
```

## 📦 Dependências Comuns

### WhatsApp
- `whatsapp-web.js` - Bot WhatsApp
- `qrcode-terminal` - QR Code no terminal

### IA/ML
- `openai` - API OpenAI (Whisper, GPT)

### Banco de Dados
- `sqlite3` - Banco SQLite

### Utilitários
- `dotenv` - Variáveis de ambiente
- `date-fns` - Manipulação de datas

## 🚀 Deploy Checklist

- [ ] Variáveis de ambiente configuradas
- [ ] `.env` não commitado
- [ ] Dockerfile testado localmente
- [ ] Volumes configurados corretamente
- [ ] Permissões de arquivos corretas
- [ ] Logs funcionando
- [ ] Backup de dados importantes
- [ ] Documentação atualizada
- [ ] Testes básicos realizados

## 🎓 Lições Aprendidas

1. **Sempre testar localmente antes de deploy**
2. **Logs detalhados são essenciais para debug**
3. **Fallbacks são importantes para resiliência**
4. **Prevenir loops desde o início**
5. **Documentação clara economiza tempo**
6. **GitHub Pages precisa ser habilitado manualmente primeiro**
7. **Docker precisa de dependências do sistema explícitas**
8. **package-lock.json deve estar sincronizado**
9. **Mensagens próprias precisam tratamento especial**
10. **Cache é essencial para prevenir processamento duplicado**

## 🔄 Próximos Passos Sugeridos

1. Adicionar testes automatizados
2. Implementar CI/CD completo
3. Adicionar monitoramento e alertas
4. Otimizar queries do banco de dados
5. Adicionar mais categorias automáticas
6. Implementar backup automático
7. Adicionar dashboard web
8. Suporte a múltiplos idiomas

---

**Última atualização:** 2024-11-22
**Projeto:** Assistente de Finanças Pessoais para WhatsApp

