import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar banco de dados
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/finances.db');

class DashboardDatabase {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  async getSummary(userId, startDate, endDate) {
    const expenses = await this.get(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?`,
      [userId, startDate, endDate]
    );

    const income = await this.get(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE user_id = ? AND type = 'income' AND date >= ? AND date <= ?`,
      [userId, startDate, endDate]
    );

    return {
      totalExpenses: expenses?.total || 0,
      totalIncome: income?.total || 0,
      balance: (income?.total || 0) - (expenses?.total || 0)
    };
  }

  async getTransactions(userId, startDate, endDate, limit = 100) {
    return await this.all(
      `SELECT * FROM transactions 
       WHERE user_id = ? AND date >= ? AND date <= ?
       ORDER BY date DESC 
       LIMIT ?`,
      [userId, startDate, endDate, limit]
    );
  }

  async getTransactionsByCategory(userId, startDate, endDate) {
    return await this.all(
      `SELECT category, type, SUM(amount) as total, COUNT(*) as count
       FROM transactions 
       WHERE user_id = ? AND date >= ? AND date <= ? AND category IS NOT NULL
       GROUP BY category, type
       ORDER BY total DESC`,
      [userId, startDate, endDate]
    );
  }

  async getMonthlyData(userId, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return await this.all(
      `SELECT 
        strftime('%Y-%m', date) as month,
        type,
        SUM(amount) as total
       FROM transactions 
       WHERE user_id = ? AND date >= ?
       GROUP BY month, type
       ORDER BY month ASC`,
      [userId, startDate.toISOString()]
    );
  }

  async getDailyData(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.all(
      `SELECT 
        date(date) as day,
        type,
        SUM(amount) as total
       FROM transactions 
       WHERE user_id = ? AND date >= ?
       GROUP BY day, type
       ORDER BY day ASC`,
      [userId, startDate.toISOString()]
    );
  }

  async getAllUsers() {
    return await this.all(
      `SELECT DISTINCT user_id FROM transactions ORDER BY user_id`
    );
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

const db = new DashboardDatabase(dbPath);

// Verificar se banco existe
if (!fs.existsSync(dbPath)) {
  console.warn('⚠️  Banco de dados não encontrado:', dbPath);
  console.warn('   Certifique-se de que o bot já foi executado pelo menos uma vez.');
}

// Rotas da API

// Listar usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Resumo geral
app.get('/api/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate || now.toISOString();
    
    const summary = await db.getSummary(userId, start, end);
    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

// Transações
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit } = req.query;
    
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate || now.toISOString();
    const limitNum = limit ? parseInt(limit) : 100;
    
    const transactions = await db.getTransactions(userId, start, end, limitNum);
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Dados por categoria
app.get('/api/categories/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate || now.toISOString();
    
    const categories = await db.getTransactionsByCategory(userId, start, end);
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Dados mensais
app.get('/api/monthly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { months } = req.query;
    const monthsNum = months ? parseInt(months) : 6;
    
    const monthlyData = await db.getMonthlyData(userId, monthsNum);
    res.json(monthlyData);
  } catch (error) {
    console.error('Erro ao buscar dados mensais:', error);
    res.status(500).json({ error: 'Erro ao buscar dados mensais' });
  }
});

// Dados diários
app.get('/api/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;
    const daysNum = days ? parseInt(days) : 30;
    
    const dailyData = await db.getDailyData(userId, daysNum);
    res.json(dailyData);
  } catch (error) {
    console.error('Erro ao buscar dados diários:', error);
    res.status(500).json({ error: 'Erro ao buscar dados diários' });
  }
});

// Rota raiz - servir dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`📊 Dashboard rodando em http://localhost:${PORT}`);
  console.log(`📁 Banco de dados: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await db.close();
  process.exit(0);
});

