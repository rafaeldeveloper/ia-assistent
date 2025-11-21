import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AudioProcessor {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.useAI = true;
    } else {
      this.useAI = false;
      console.log('⚠️  OpenAI API Key não configurada. Transcrição de áudio não disponível.');
    }
  }

  async transcribeAudio(message) {
    if (!this.useAI) {
      console.log('❌ Transcrição de áudio não disponível sem OpenAI API Key');
      return null;
    }

    try {
      console.log('🎤 Processando mensagem de áudio...');
      console.log('📋 Tipo da mensagem:', message.type);
      console.log('📋 HasMedia:', message.hasMedia);
      
      // Baixar o áudio
      const media = await message.downloadMedia();
      if (!media) {
        console.log('❌ Não foi possível baixar o áudio');
        return null;
      }

      console.log('📋 Media mimetype:', media.mimetype);
      
      // Verificar se é realmente áudio
      if (!media.mimetype || (!media.mimetype.includes('audio') && !media.mimetype.includes('ogg'))) {
        console.log('⚠️ Media baixada não é áudio:', media.mimetype);
        return null;
      }

      // Criar diretório temporário se não existir
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Salvar arquivo temporário
      const tempFilePath = path.join(tempDir, `audio_${Date.now()}.ogg`);
      const buffer = Buffer.from(media.data, 'base64');
      fs.writeFileSync(tempFilePath, buffer);

      console.log('📁 Áudio salvo temporariamente:', tempFilePath);

      // Transcrever usando Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'pt', // Português
        response_format: 'text'
      });

      // Remover arquivo temporário
      fs.unlinkSync(tempFilePath);
      console.log('🗑️ Arquivo temporário removido');

      const transcribedText = transcription.toString().trim();
      console.log('✅ Transcrição:', transcribedText);

      return transcribedText;
    } catch (error) {
      console.error('❌ Erro ao transcrever áudio:', error);
      
      // Tentar limpar arquivo temporário em caso de erro
      try {
        const tempDir = path.join(__dirname, '../temp');
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          if (file.startsWith('audio_')) {
            fs.unlinkSync(path.join(tempDir, file));
          }
        });
      } catch (cleanupError) {
        console.error('Erro ao limpar arquivos temporários:', cleanupError);
      }
      
      return null;
    }
  }
}

