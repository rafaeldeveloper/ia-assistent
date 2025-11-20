import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  constructor() {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/finances.db');
    
    // Criar diretório se não existir
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath);
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  async initialize() {
    await this.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_user_date ON transactions(user_id, date)
    `);

    await this.run(`
      CREATE INDEX IF NOT EXISTS idx_user_type ON transactions(user_id, type)
    `);

    console.log('✅ Banco de dados inicializado');
  }

  async addTransaction(transaction) {
    const { userId, type, amount, description, category, date } = transaction;
    
    await this.run(
      `INSERT INTO transactions (user_id, type, amount, description, category, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, amount, description || '', category || null, date || new Date().toISOString()]
    );
  }

  async getTransactions(userId, startDate, endDate) {
    return await this.all(
      `SELECT * FROM transactions 
       WHERE user_id = ? AND date >= ? AND date <= ?
       ORDER BY date DESC`,
      [userId, startDate, endDate]
    );
  }

  async getRecentExpenses(userId, limit = 10) {
    return await this.all(
      `SELECT * FROM transactions 
       WHERE user_id = ? AND type = 'expense'
       ORDER BY date DESC 
       LIMIT ?`,
      [userId, limit]
    );
  }

  async getTransactionsByType(userId, type, startDate, endDate) {
    return await this.all(
      `SELECT * FROM transactions 
       WHERE user_id = ? AND type = ? AND date >= ? AND date <= ?
       ORDER BY date DESC`,
      [userId, type, startDate, endDate]
    );
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

  async getTransactionsByCategory(userId, startDate, endDate) {
    return await this.all(
      `SELECT category, type, SUM(amount) as total 
       FROM transactions 
       WHERE user_id = ? AND date >= ? AND date <= ? AND category IS NOT NULL
       GROUP BY category, type
       ORDER BY total DESC`,
      [userId, startDate, endDate]
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

