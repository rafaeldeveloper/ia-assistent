import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

// Mapeamento de meses em português
const monthsPT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

export class ReportGenerator {
  constructor(database) {
    this.db = database;
    this.ptBR = null;
    this.loadLocale();
  }

  async loadLocale() {
    try {
      // Tentar carregar o locale dinamicamente
      const localeModule = await import('date-fns/locale/pt-BR/index.js');
      this.ptBR = localeModule.ptBR;
    } catch (error) {
      // Se falhar, usar formatação manual
      console.log('⚠️  Locale pt-BR não disponível, usando formatação manual');
      this.ptBR = null;
    }
  }

  formatMonthYear(date) {
    if (this.ptBR) {
      return format(date, 'MMMM yyyy', { locale: this.ptBR });
    }
    // Formatação manual em português
    const month = monthsPT[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  }

  async generateReport(userId, period = 'month') {
    // Garantir que o locale foi carregado
    if (this.ptBR === null) {
      await this.loadLocale();
    }

    let startDate, endDate, periodLabel;

    const now = new Date();

    if (period === 'week') {
      startDate = startOfWeek(now, this.ptBR ? { locale: this.ptBR } : { weekStartsOn: 1 });
      endDate = endOfWeek(now, this.ptBR ? { locale: this.ptBR } : { weekStartsOn: 1 });
      periodLabel = 'Semana Atual';
    } else if (period === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = this.formatMonthYear(now);
    } else if (/^\d{4}-\d{2}$/.test(period)) {
      // Formato YYYY-MM
      const [year, month] = period.split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = endOfMonth(startDate);
      periodLabel = this.formatMonthYear(startDate);
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = this.formatMonthYear(now);
    }

    const summary = await this.db.getSummary(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    const transactions = await this.db.getTransactions(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    const categories = await this.db.getTransactionsByCategory(
      userId,
      startDate.toISOString(),
      endDate.toISOString()
    );

    // Construir relatório
    let report = `📊 *Relatório Financeiro*\n`;
    report += `📅 Período: ${periodLabel}\n\n`;

    report += `💰 *Resumo:*\n`;
    report += `Receitas: R$ ${summary.totalIncome.toFixed(2)}\n`;
    report += `Despesas: R$ ${summary.totalExpenses.toFixed(2)}\n`;
    
    const balance = summary.balance;
    const balanceEmoji = balance >= 0 ? '✅' : '⚠️';
    report += `${balanceEmoji} Saldo: R$ ${balance.toFixed(2)}\n\n`;

    // Categorias
    if (categories.length > 0) {
      report += `📋 *Gastos por Categoria:*\n`;
      const expenseCategories = categories.filter(c => c.type === 'expense');
      
      if (expenseCategories.length > 0) {
        expenseCategories.slice(0, 5).forEach(cat => {
          report += `• ${cat.category}: R$ ${cat.total.toFixed(2)}\n`;
        });
        report += `\n`;
      }
    }

    // Últimas transações
    if (transactions.length > 0) {
      report += `📝 *Últimas Transações:*\n`;
      transactions.slice(0, 5).forEach(trans => {
        const emoji = trans.type === 'income' ? '💰' : '💸';
        const date = format(parseISO(trans.date), 'dd/MM', this.ptBR ? { locale: this.ptBR } : {});
        report += `${emoji} ${date} - R$ ${trans.amount.toFixed(2)}\n`;
        report += `   ${trans.description}\n`;
      });
    } else {
      report += `\n📝 Nenhuma transação registrada neste período.`;
    }

    return report;
  }
}

