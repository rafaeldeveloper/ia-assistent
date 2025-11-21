import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { Database } from './database.js';
import { MessageProcessor } from './messageProcessor.js';
import { ReportGenerator } from './reportGenerator.js';
import { AudioProcessor } from './audioProcessor.js';

dotenv.config();

class FinanceAssistant {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    
    this.db = new Database();
    this.messageProcessor = new MessageProcessor();
    this.reportGenerator = new ReportGenerator(this.db);
    this.audioProcessor = new AudioProcessor();
    
    // Flag para prevenir loop (ativar para testes)
    // Por padrão ativado, mas pode ser desativado com PREVENT_LOOP=false no .env
    this.preventLoop = process.env.PREVENT_LOOP !== 'false';
    this.processedMessages = new Map(); // Cache de mensagens processadas
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos em milissegundos
    
    // Limpar cache periodicamente
    if (this.preventLoop) {
      setInterval(() => {
        this.cleanProcessedMessagesCache();
      }, this.cacheTimeout);
    }
    
    this.setupEventHandlers();
  }

  cleanProcessedMessagesCache() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, timestamp] of this.processedMessages.entries()) {
      if (now - timestamp > this.cacheTimeout) {
        this.processedMessages.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`🧹 Limpeza de cache: ${cleaned} mensagens antigas removidas`);
    }
  }

  getMessageKey(message) {
    // Usar ID da mensagem se disponível, senão usar hash do conteúdo + remetente
    const messageId = message.id?._serialized || message.id;
    const from = message.fromMe ? 'me' : (message.from || 'unknown');
    const timestamp = message.timestamp || Date.now();
    
    // Priorizar usar o ID da mensagem que é único
    if (messageId) {
      return `${from}:${messageId}`;
    }
    
    // Fallback: usar conteúdo + remetente + timestamp (arredondado para segundos)
    const body = (message.body || '').substring(0, 50);
    const timeKey = Math.floor(timestamp / 1000); // Arredondar para segundos
    return `${from}:${body}:${timeKey}`;
  }

  isMessageProcessed(message) {
    if (!this.preventLoop) {
      return false;
    }
    
    const key = this.getMessageKey(message);
    const isProcessed = this.processedMessages.has(key);
    
    if (isProcessed) {
      console.log('🔄 Mensagem já processada, ignorando para prevenir loop:', key);
      return true;
    }
    
    // Não marcar aqui - será marcada apenas após processamento bem-sucedido
    return false;
  }

  markMessageAsProcessed(message) {
    if (!this.preventLoop) {
      return;
    }
    
    const key = this.getMessageKey(message);
    this.processedMessages.set(key, Date.now());
    console.log('✅ Mensagem marcada como processada:', key);
  }

  setupEventHandlers() {
    // QR Code para autenticação
    this.client.on('qr', (qr) => {
      console.log('Escaneie o QR Code abaixo com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Cliente pronto
    this.client.on('ready', () => {
      console.log('✅ Assistente de Finanças conectado ao WhatsApp!');
    });

    // Autenticação realizada
    this.client.on('authenticated', () => {
      console.log('✅ Autenticação realizada!');
    });

    // Erro de autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Erro de autenticação:', msg);
    });

    // Mensagem recebida
    this.client.on('message', async (message) => {
      console.log('🔔 Evento message disparado');
      // Ignorar mensagens próprias no evento 'message' (serão processadas em message_create)
      // Isso evita processar duas vezes
      if (!message.fromMe) {
        await this.handleMessage(message);
      } else {
        console.log('⏭️ Mensagem própria ignorada no evento message (será processada em message_create)');
      }
    });

    // Mensagem criada (inclui mensagens próprias)
    this.client.on('message_create', async (message) => {
      console.log('🔔 Evento message_create disparado');
      // Processar mensagens próprias (incluindo áudio)
      // Verificar se não é uma mensagem de status
      if (message.fromMe && !message.isStatus) {
        // Verificar se já foi processada antes de processar
        if (!this.isMessageProcessed(message)) {
          await this.handleMessage(message);
        }
      }
    });

    // Erro geral
    this.client.on('disconnected', (reason) => {
      console.log('❌ Cliente desconectado:', reason);
    });
  }

  async handleMessage(message) {
    try {
      // Ignorar mensagens de status, notificações e outros tipos não-texto
      if (message.isStatus || message.type === 'protocol' || message.type === 'e2e_notification') {
        console.log('⏭️ Ignorando mensagem de status/notificação:', message.type);
        return;
      }

      // Verificar se mensagem já foi processada (prevenir loop)
      if (this.isMessageProcessed(message)) {
        return;
      }

      // Log inicial para debug
      console.log('📨 Mensagem recebida!');
      console.log('From:', message.from);
      console.log('FromMe:', message.fromMe);
      console.log('Body:', message.body);
      console.log('Type:', message.type);
      console.log('Has Media:', message.hasMedia);
      console.log('Message ID:', message.id?._serialized || message.id);

      // Processar mensagens de áudio (voice notes) PRIMEIRO, antes de outras verificações
      if (message.type === 'ptt' || message.type === 'audio' || message.hasMedia) {
        console.log('🎤 Mensagem de áudio detectada (type:', message.type, ', hasMedia:', message.hasMedia, ')');
        
        // Verificar se realmente é áudio
        const media = await message.downloadMedia();
        if (media && (media.mimetype?.includes('audio') || media.mimetype?.includes('ogg'))) {
          console.log('✅ Confirmado: é uma mensagem de áudio (mimetype:', media.mimetype, ')');
          const transcribedText = await this.audioProcessor.transcribeAudio(message);
          
          if (transcribedText) {
            console.log('📝 Texto transcrito:', transcribedText);
            // Substituir o body da mensagem com o texto transcrito para processar normalmente
            message.body = transcribedText;
          } else {
            await message.reply('❌ Não foi possível transcrever o áudio. Verifique se a OpenAI API Key está configurada e tente novamente, ou envie uma mensagem de texto.');
            this.markMessageAsProcessed(message); // Marcar como processada para não tentar novamente
            return;
          }
        } else {
          console.log('⚠️ Tem hasMedia mas não é áudio (mimetype:', media?.mimetype, ')');
        }
      }

      // Ignorar mensagens que são respostas do próprio bot (após processar áudio)
      if (message.fromMe && !message.body) {
        console.log('⏭️ Ignorando mensagem própria sem corpo (provavelmente resposta do bot)');
        return;
      }

      // Verificar se é uma resposta automática do bot (padrões comuns nas respostas)
      if (message.fromMe && message.body) {
        const body = message.body.toLowerCase();
        // Padrões que indicam que é uma resposta automática do bot
        const botResponsePatterns = [
          '✅ transação registrada',
          '📊 relatório financeiro',
          '📋 últimos gastos',
          '💰 assistente de finanças',
          '❌ ops! ocorreu um erro'
        ];
        
        if (botResponsePatterns.some(pattern => body.includes(pattern))) {
          console.log('⏭️ Ignorando resposta automática do bot');
          return;
        }
      }

      // Se não tem corpo de texto, ignorar (não marca como processada)
      if (!message.body || message.body.trim().length === 0) {
        console.log('⏭️ Mensagem sem corpo de texto, ignorando');
        return;
      }

      const contact = await message.getContact();
      const chat = await message.getChat();
      const body = message.body.toLowerCase().trim();

      console.log('Chat ID:', chat.id._serialized);
      console.log('Chat isGroup:', chat.isGroup);
      console.log('Contact ID:', contact.id.user);

      // Permitir mensagens próprias (fromMe) para teste
      if (message.fromMe) {
        console.log('✅ Mensagem própria detectada - processando...');
      }

      // Ignorar mensagens de grupos (não marca como processada)
      if (chat.isGroup) {
        console.log('⏭️ Mensagem de grupo ignorada');
        return;
      }

      // Comandos de ajuda
      if (body === 'ajuda' || body === 'help' || body === '/help' || body === '/ajuda') {
        console.log('Comando: ajuda');
        await this.sendHelpMessage(message);
        this.markMessageAsProcessed(message); // Marcar apenas após processar com sucesso
        return;
      }

      // Comando para gerar relatório
      if (body.startsWith('relatorio') || body.startsWith('relatório') || body.startsWith('/relatorio')) {
        console.log('Comando: relatorio');
        await this.handleReportCommand(message, body);
        this.markMessageAsProcessed(message); // Marcar apenas após processar com sucesso
        return;
      }

      // Comando para listar gastos recentes
      if (body.startsWith('gastos') || body.startsWith('/gastos')) {
        console.log('Comando: gastos');
        await this.handleRecentExpenses(message);
        this.markMessageAsProcessed(message); // Marcar apenas após processar com sucesso
        return;
      }

      // Tentar processar como transação financeira
      console.log('Tentando processar como transação...');
      const transaction = await this.messageProcessor.processMessage(message.body, contact.id.user);

      console.log('Transaction result:', transaction);
      
      if (transaction) {
        console.log('✅ Transação processada com sucesso!');
        await this.db.addTransaction(transaction);
        const response = `✅ Transação registrada!\n` +
          `💰 Tipo: ${transaction.type === 'expense' ? 'Despesa' : 'Receita'}\n` +
          `💵 Valor: R$ ${transaction.amount.toFixed(2)}\n` +
          `📝 Descrição: ${transaction.description}\n` +
          `📅 Data: ${new Date(transaction.date).toLocaleDateString('pt-BR')}`;
        
        await message.reply(response);
        this.markMessageAsProcessed(message); // Marcar apenas após processar com sucesso
      } else {
        console.log('⚠️ Não foi possível processar como transação');
        // Se não conseguiu processar, NÃO marca como processada
        // Assim pode tentar novamente se necessário
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      console.error('Stack:', error.stack);
      // Não marcar como processada em caso de erro, para permitir nova tentativa
      try {
        await message.reply('❌ Ops! Ocorreu um erro ao processar sua mensagem. Tente novamente.');
      } catch (replyError) {
        console.error('Erro ao enviar resposta de erro:', replyError);
      }
    }
  }

  async sendHelpMessage(message) {
    const helpText = `💰 *Assistente de Finanças Pessoais*\n\n` +
      `*Comandos disponíveis:*\n\n` +
      `📝 *Registrar gasto/receita:*\n` +
      `Envie uma mensagem descrevendo sua transação, por exemplo:\n` +
      `• "Gastei R$ 50 no supermercado"\n` +
      `• "Recebi R$ 1000 de salário"\n` +
      `• "Almoço R$ 25"\n` +
      `• "Paguei R$ 200 de conta de luz"\n\n` +
      `📊 *Relatórios:*\n` +
      `• "/relatorio" - Relatório do mês atual\n` +
      `• "/relatorio mes" - Relatório do mês atual\n` +
      `• "/relatorio semana" - Relatório da semana atual\n` +
      `• "/relatorio 2024-01" - Relatório de um mês específico\n\n` +
      `📋 *Gastos recentes:*\n` +
      `• "/gastos" - Lista os últimos 10 gastos\n\n` +
      `❓ *Ajuda:*\n` +
      `• "/ajuda" - Mostra esta mensagem`;

    await message.reply(helpText);
  }

  async handleReportCommand(message, body) {
    try {
      const parts = body.split(' ');
      let period = 'month'; // padrão: mês atual
      
      if (parts.length > 1) {
        const periodArg = parts[1].toLowerCase();
        if (periodArg === 'semana' || periodArg === 'week') {
          period = 'week';
        } else if (periodArg === 'mes' || periodArg === 'month') {
          period = 'month';
        } else if (/^\d{4}-\d{2}$/.test(periodArg)) {
          // Formato YYYY-MM
          period = periodArg;
        }
      }

      const contact = await message.getContact();
      const report = await this.reportGenerator.generateReport(contact.id.user, period);
      
      await message.reply(report);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      await message.reply('❌ Erro ao gerar relatório. Tente novamente.');
    }
  }

  async handleRecentExpenses(message) {
    try {
      const contact = await message.getContact();
      const expenses = await this.db.getRecentExpenses(contact.id.user, 10);
      
      if (expenses.length === 0) {
        await message.reply('📋 Nenhum gasto registrado ainda.');
        return;
      }

      let response = '📋 *Últimos Gastos:*\n\n';
      expenses.forEach((expense, index) => {
        const date = new Date(expense.date).toLocaleDateString('pt-BR');
        response += `${index + 1}. R$ ${expense.amount.toFixed(2)} - ${expense.description}\n`;
        response += `   📅 ${date}\n\n`;
      });

      await message.reply(response);
    } catch (error) {
      console.error('Erro ao buscar gastos:', error);
      await message.reply('❌ Erro ao buscar gastos. Tente novamente.');
    }
  }

  async start() {
    await this.db.initialize();
    await this.client.initialize();
  }
}

// Iniciar o assistente
const assistant = new FinanceAssistant();
assistant.start().catch(console.error);

