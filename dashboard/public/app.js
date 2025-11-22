// Configuração
const API_BASE = window.location.origin;
let currentUserId = '';
let currentPeriod = 'month';
let categoryChart = null;
let monthlyChart = null;
let dailyChart = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    setupEventListeners();
});

// Carregar usuários
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/api/users`);
        const users = await response.json();
        
        const select = document.getElementById('userSelect');
        select.innerHTML = '<option value="">Selecione um usuário</option>';
        
        if (users.length === 0) {
            select.innerHTML = '<option value="">Nenhum usuário encontrado</option>';
            return;
        }
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.user_id;
            option.textContent = `Usuário: ${user.user_id.substring(0, 8)}...`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('userSelect').innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('userSelect').addEventListener('change', (e) => {
        currentUserId = e.target.value;
        if (currentUserId) {
            loadDashboard();
        } else {
            hideMainContent();
        }
    });
    
    document.getElementById('periodSelect').addEventListener('change', (e) => {
        currentPeriod = e.target.value;
        if (currentUserId) {
            loadDashboard();
        }
    });
}

// Carregar dashboard
async function loadDashboard() {
    if (!currentUserId) return;
    
    showLoading();
    
    try {
        const [summary, transactions, categories, monthly, daily] = await Promise.all([
            fetchSummary(),
            fetchTransactions(),
            fetchCategories(),
            fetchMonthly(),
            fetchDaily()
        ]);
        
        updateSummary(summary);
        updateTransactions(transactions);
        updateCategoryChart(categories);
        updateMonthlyChart(monthly);
        updateDailyChart(daily);
        
        hideLoading();
        showMainContent();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        hideLoading();
        alert('Erro ao carregar dados. Verifique se o servidor está rodando.');
    }
}

// Fetch functions
async function fetchSummary() {
    const { startDate, endDate } = getDateRange();
    const response = await fetch(`${API_BASE}/api/summary/${currentUserId}?startDate=${startDate}&endDate=${endDate}`);
    return await response.json();
}

async function fetchTransactions() {
    const { startDate, endDate } = getDateRange();
    const response = await fetch(`${API_BASE}/api/transactions/${currentUserId}?startDate=${startDate}&endDate=${endDate}&limit=50`);
    return await response.json();
}

async function fetchCategories() {
    const { startDate, endDate } = getDateRange();
    const response = await fetch(`${API_BASE}/api/categories/${currentUserId}?startDate=${startDate}&endDate=${endDate}`);
    return await response.json();
}

async function fetchMonthly() {
    const response = await fetch(`${API_BASE}/api/monthly/${currentUserId}?months=6`);
    return await response.json();
}

async function fetchDaily() {
    const response = await fetch(`${API_BASE}/api/daily/${currentUserId}?days=30`);
    return await response.json();
}

// Date range helper
function getDateRange() {
    const now = new Date();
    let startDate, endDate;
    
    switch (currentPeriod) {
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            startDate = weekStart.toISOString();
            endDate = now.toISOString();
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1).toISOString();
            endDate = now.toISOString();
            break;
        case 'all':
            startDate = '2020-01-01';
            endDate = now.toISOString();
            break;
        default: // month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            endDate = now.toISOString();
    }
    
    return { startDate, endDate };
}

// Update UI
function updateSummary(summary) {
    document.getElementById('totalIncome').textContent = formatCurrency(summary.totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(summary.totalExpenses);
    
    const balance = summary.balance;
    const balanceEl = document.getElementById('totalBalance');
    balanceEl.textContent = formatCurrency(Math.abs(balance));
    balanceEl.className = 'card-value ' + (balance >= 0 ? 'value-positive' : 'value-negative');
}

function updateTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma transação encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(trans => `
        <tr>
            <td>${formatDate(trans.date)}</td>
            <td><span class="badge badge-${trans.type}">${trans.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
            <td>${trans.description || '-'}</td>
            <td>${trans.category || '-'}</td>
            <td class="${trans.type === 'income' ? 'value-positive' : 'value-negative'}">
                ${trans.type === 'income' ? '+' : '-'}${formatCurrency(trans.amount)}
            </td>
        </tr>
    `).join('');
}

function updateCategoryChart(categories) {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: expenseCategories.map(c => c.category || 'Sem categoria'),
            datasets: [{
                data: expenseCategories.map(c => c.total),
                backgroundColor: [
                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
                    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.label}: ${formatCurrency(context.parsed)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateMonthlyChart(data) {
    const months = [...new Set(data.map(d => d.month))].sort();
    const incomeData = new Array(months.length).fill(0);
    const expenseData = new Array(months.length).fill(0);
    
    data.forEach(d => {
        const index = months.indexOf(d.month);
        if (d.type === 'income') {
            incomeData[index] = d.total;
        } else {
            expenseData[index] = d.total;
        }
    });
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => formatMonth(m)),
            datasets: [{
                label: 'Receitas',
                data: incomeData,
                backgroundColor: '#10B981'
            }, {
                label: 'Despesas',
                data: expenseData,
                backgroundColor: '#EF4444'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formatCurrency(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateDailyChart(data) {
    const days = [...new Set(data.map(d => d.day))].sort();
    const incomeData = new Array(days.length).fill(0);
    const expenseData = new Array(days.length).fill(0);
    
    data.forEach(d => {
        const index = days.indexOf(d.day);
        if (d.type === 'income') {
            incomeData[index] = d.total;
        } else {
            expenseData[index] = d.total;
        }
    });
    
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    const ctx = document.getElementById('dailyChart').getContext('2d');
    
    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days.map(d => formatDate(d)),
            datasets: [{
                label: 'Receitas',
                data: incomeData,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Despesas',
                data: expenseData,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formatCurrency(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            }
        }
    });
}

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

function formatMonth(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: 'numeric'
    }).format(date);
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
}

function hideMainContent() {
    document.getElementById('mainContent').style.display = 'none';
}

