// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const transactionsContainer = document.getElementById('transactions-container');
const balanceElement = document.getElementById('balance');
const incomeElement = document.getElementById('income');
const expenseElement = document.getElementById('expense');

// Format date to display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format currency to Indian Rupees
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
}

// Update transaction UI
function updateTransactionUI() {
    const transactions = getUserTransactions();
    
    // Clear container
    transactionsContainer.innerHTML = '';
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    if (sortedTransactions.length === 0) {
        transactionsContainer.innerHTML = '<p>No transactions yet. Add one to get started!</p>';
    } else {
        sortedTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.classList.add('transaction-item');
            
            const sign = transaction.type === 'income' ? '+' : '-';
            const amountClass = transaction.type === 'income' ? 'income' : 'expense';
            
            item.innerHTML = `
                <div class="transaction-details">
                    <h4>${transaction.text}</h4>
                    <span class="transaction-date">${formatDate(transaction.date)}</span>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${sign}${formatCurrency(Math.abs(transaction.amount))}
                </div>
                <button class="delete-btn" onclick="handleDeleteTransaction('${transaction.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            transactionsContainer.appendChild(item);
        });
    }
    
    updateBalance();
}

// Update balance, income and expense
function updateBalance() {
    const transactions = getUserTransactions();
    
    // Calculate totals
    const balance = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            return acc + parseFloat(transaction.amount);
        } else {
            return acc - parseFloat(transaction.amount);
        }
    }, 0);
    
    const income = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);
    
    const expense = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);
    
    // Update UI
    balanceElement.textContent = formatCurrency(balance);
    incomeElement.textContent = formatCurrency(income);
    expenseElement.textContent = formatCurrency(expense);
    
    // Set balance color based on value
    if (balance < 0) {
        balanceElement.style.color = 'var(--expense-color)';
    } else {
        balanceElement.style.color = 'var(--primary-color)';
    }
}

// Handle transaction form submission
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = document.getElementById('transaction-text').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const date = document.getElementById('transaction-date').value;
    
    if (text.trim() === '' || isNaN(amount) || amount <= 0) {
        showNotification('Please provide a valid description and positive amount', 'error');
        return;
    }
    
    // Create transaction object
    const transaction = {
        id: Date.now().toString(),
        text,
        amount,
        type,
        date
    };
    
    // Save transaction
    if (saveTransaction(transaction)) {
        showNotification('Transaction added successfully', 'success');
        transactionForm.reset();
        
        // Set default date to today
        document.getElementById('transaction-date').valueAsDate = new Date();
        
        // Update UI
        updateTransactionUI();
    }
});

// Handle transaction deletion
function handleDeleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        if (deleteTransaction(id)) {
            showNotification('Transaction deleted', 'success');
            updateTransactionUI();
        }
    }
}

// Set default date to today when the form loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('transaction-date').valueAsDate = new Date();
});

// Print Transactions Function
function printTransactions() {
    const transactions = getUserTransactions();
    
    if (transactions.length === 0) {
        showNotification('No transactions to print', 'error');
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    
    const balance = totalIncome - totalExpense;
    
    // Create a new window
    const printWindow = window.open('', '_blank');
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userName = currentUser ? currentUser.name : 'User';
    
    // Current date
    const printDate = new Date().toLocaleDateString();
    const printTime = new Date().toLocaleTimeString();
    
    // Generate HTML content
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Transaction Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 40px;
                    color: #333;
                }
                @media print {
                    .no-print {
                        display: none;
                    }
                }
                h1 {
                    color: #3a86ff;
                    margin-bottom: 10px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                }
                .meta-info {
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .income {
                    color: #2ecc71;
                }
                .expense {
                    color: #e74c3c;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                }
                .summary {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .summary-item {
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                    flex: 1;
                    margin: 0 10px;
                }
                .print-btn {
                    background: #3a86ff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <h1>Transaction Report</h1>
                    <button class="print-btn no-print" onclick="window.print()">Print</button>
                </div>
                
                <div class="meta-info">
                    <p><strong>User:</strong> ${userName}</p>
                    <p><strong>Generated on:</strong> ${printDate} at ${printTime}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
    `);
    
    // Add transaction rows
    sortedTransactions.forEach(transaction => {
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const sign = transaction.type === 'income' ? '+' : '-';
        
        printWindow.document.write(`
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.text}</td>
                <td style="text-transform: capitalize;">${transaction.type}</td>
                <td class="${amountClass}">${sign}${formatCurrency(Math.abs(transaction.amount))}</td>
            </tr>
        `);
    });
    
    // Complete the HTML content with summary
    printWindow.document.write(`
                    </tbody>
                </table>
                
                <div class="footer">
                    <h3>Summary</h3>
                    <div class="summary">
                        <div class="summary-item" style="background-color: rgba(46, 204, 113, 0.1); border: 1px solid #2ecc71;">
                            <h4>Total Income</h4>
                            <p class="income">${formatCurrency(totalIncome)}</p>
                        </div>
                        <div class="summary-item" style="background-color: rgba(231, 76, 60, 0.1); border: 1px solid #e74c3c;">
                            <h4>Total Expenses</h4>
                            <p class="expense">${formatCurrency(totalExpense)}</p>
                        </div>
                        <div class="summary-item" style="background-color: rgba(58, 134, 255, 0.1); border: 1px solid #3a86ff;">
                            <h4>Balance</h4>
                            <p style="color: ${balance >= 0 ? '#2ecc71' : '#e74c3c'};">${formatCurrency(balance)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 40px;">
                <p>Tip: Use your browser's print function to save this report as a PDF.</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}