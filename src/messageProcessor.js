import OpenAI from 'openai';

export class MessageProcessor {
  constructor() {
    // Se não tiver API key da OpenAI, usa processamento básico
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.useAI = true;
    } else {
      this.useAI = false;
      console.log('⚠️  OpenAI API Key não configurada. Usando processamento básico.');
    }
  }

  async processMessage(message, userId) {
    console.log(message, "message");
    console.log(userId, "userId");
    if (this.useAI) {
      return await this.processWithAI(message, userId);
    } else {
      return await this.processBasic(message, userId);
    }
  }

  async processWithAI(message, userId) {
    try {
      const prompt = `Analise a seguinte mensagem e extraia informações financeiras. 
Responda APENAS com um JSON válido no formato:
{
  "isTransaction": true/false,
  "type": "expense" ou "income",
  "amount": número,
  "description": "texto",
  "category": "categoria" (opcional)
}

Se não for uma transação financeira, retorne {"isTransaction": false}.

Exemplos:
- "Gastei R$ 50 no supermercado" -> {"isTransaction": true, "type": "expense", "amount": 50, "description": "Supermercado", "category": "Alimentação"}
- "Recebi R$ 1000 de salário" -> {"isTransaction": true, "type": "income", "amount": 1000, "description": "Salário", "category": "Salário"}
- "Almoço R$ 25" -> {"isTransaction": true, "type": "expense", "amount": 25, "description": "Almoço", "category": "Alimentação"}
- "Olá, como vai?" -> {"isTransaction": false}

Mensagem: "${message}"`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Você é um assistente que extrai informações financeiras de mensagens. Responda APENAS com JSON válido." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const response = completion.choices[0].message.content.trim();
      
      // Tentar extrair JSON da resposta
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.isTransaction) {
        return null;
      }

      return {
        userId,
        type: parsed.type,
        amount: parseFloat(parsed.amount),
        description: parsed.description,
        category: parsed.category || null,
        date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao processar com IA:', error);
      // Fallback para processamento básico
      return await this.processBasic(message, userId);
    }
  }

  async processBasic(message, userId) {
    console.log('🔍 Processando mensagem com método básico:', message);
    
    // Processamento básico usando regex
    const text = message.toLowerCase();
    console.log('📝 Texto processado (lowercase):', text);
    
    // Padrões para identificar valores monetários
    const moneyPatterns = [
      /(?:gastei|paguei|comprei|despesa|gasto|gastou|paguei|pague)\s+(?:de\s+)?r\$\s*(\d+(?:[.,]\d{2})?)/i,
      /r\$\s*(\d+(?:[.,]\d{2})?)\s+(?:em|no|na|de|para|com|por)/i,
      /(\d+(?:[.,]\d{2})?)\s+reais/i,
      /(?:recebi|ganhei|entrada|salário|salario|recebeu)\s+(?:de\s+)?r\$\s*(\d+(?:[.,]\d{2})?)/i,
      /(?:almoço|almoco|jantar|café|cafe|lanche)\s+(?:de\s+)?r\$\s*(\d+(?:[.,]\d{2})?)/i,
      /(?:almoço|almoco|jantar|café|cafe|lanche)\s+(\d+(?:[.,]\d{2})?)/i
    ];

    let amount = null;
    let type = 'expense'; // padrão: despesa

    // Tentar encontrar valor monetário
    console.log('🔎 Tentando padrões complexos...');
    for (let i = 0; i < moneyPatterns.length; i++) {
      const pattern = moneyPatterns[i];
      const match = text.match(pattern);
      console.log(`Padrão ${i + 1}:`, pattern, 'Match:', match);
      if (match) {
        amount = parseFloat(match[1].replace(',', '.'));
        console.log('✅ Valor encontrado:', amount);
        
        // Verificar se é receita
        if (text.match(/(?:recebi|ganhei|entrada|salário|salario)/i)) {
          type = 'income';
          console.log('💰 Tipo: Receita');
        } else {
          console.log('💸 Tipo: Despesa');
        }
        break;
      }
    }

    // Se não encontrou valor explícito, tentar padrões mais simples
    if (!amount) {
      console.log('🔎 Tentando padrão simples R$...');
      const simplePattern = /r\$\s*(\d+(?:[.,]\d{2})?)/i;
      const match = text.match(simplePattern);
      console.log('Match padrão simples:', match);
      if (match) {
        amount = parseFloat(match[1].replace(',', '.'));
        console.log('✅ Valor encontrado (padrão simples):', amount);
      }
    }

    // Se ainda não encontrou, tentar número seguido de "reais" ou "R$"
    if (!amount) {
      console.log('🔎 Tentando padrão número + reais...');
      const numberPattern = /(\d+(?:[.,]\d{2})?)\s*(?:reais|r\$)/i;
      const match = text.match(numberPattern);
      console.log('Match número + reais:', match);
      if (match) {
        amount = parseFloat(match[1].replace(',', '.'));
        console.log('✅ Valor encontrado (número + reais):', amount);
      }
    }

    // Tentar padrão ainda mais simples: qualquer número seguido de espaço ou fim de linha
    if (!amount) {
      console.log('🔎 Tentando padrão número simples...');
      const simpleNumberPattern = /(\d+(?:[.,]\d{2})?)/;
      const match = text.match(simpleNumberPattern);
      console.log('Match número simples:', match);
      if (match) {
        const potentialAmount = parseFloat(match[1].replace(',', '.'));
        // Só aceitar se for um valor razoável (entre 0.01 e 1000000)
        if (potentialAmount >= 0.01 && potentialAmount <= 1000000) {
          amount = potentialAmount;
          console.log('✅ Valor encontrado (número simples):', amount);
        }
      }
    }

    if (!amount || amount <= 0) {
      console.log('❌ Nenhum valor monetário encontrado na mensagem');
      return null;
    }

    // Extrair descrição (remover valores monetários e palavras comuns)
    let description = message
      .replace(/r\$\s*\d+(?:[.,]\d{2})?/gi, '')
      .replace(/\d+(?:[.,]\d{2})?\s*(?:reais|r\$)/gi, '')
      .replace(/\d+(?:[.,]\d{2})?/g, '') // Remover qualquer número restante
      .replace(/(?:gastei|paguei|comprei|recebi|ganhei|despesa|gasto)\s+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description || description.length < 3) {
      description = 'Transação sem descrição';
    }

    console.log('📝 Descrição extraída:', description);

    // Tentar identificar categoria básica
    const category = this.identifyCategory(text);
    console.log('🏷️ Categoria identificada:', category);

    const result = {
      userId,
      type,
      amount,
      description: description.substring(0, 200), // Limitar tamanho
      category,
      date: new Date().toISOString()
    };

    console.log('✅ Transação processada:', result);
    return result;
  }

  identifyCategory(text) {
    const categories = {
      'Alimentação': ['comida', 'almoço', 'jantar', 'café', 'lanche', 'restaurante', 'supermercado', 'mercado', 'padaria'],
      'Transporte': ['uber', 'taxi', 'ônibus', 'onibus', 'metrô', 'metro', 'combustível', 'combustivel', 'gasolina', 'estacionamento'],
      'Moradia': ['aluguel', 'luz', 'água', 'agua', 'internet', 'telefone', 'condomínio', 'condominio'],
      'Saúde': ['farmacia', 'farmácia', 'médico', 'medico', 'hospital', 'remédio', 'remedio'],
      'Educação': ['curso', 'livro', 'escola', 'faculdade', 'universidade'],
      'Lazer': ['cinema', 'show', 'viagem', 'festa', 'bar', 'balada'],
      'Compras': ['roupa', 'calçado', 'eletrônico', 'eletronico', 'loja']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return null;
  }
}

