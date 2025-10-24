// Simple PDF generation using browser's built-in capabilities
// This will work without external dependencies

export interface PDFData {
  title: string
  period: string
  generatedAt: string
  summary: {
    totalIncome: number
    totalExpenses: number
    netBalance: number
    savingsRate: number
  }
  categories: Array<{
    name: string
    amount: number
    percentage: number
    icon: string
    color: string
  }>
  transactions: Array<{
    date: string
    title: string
    category: string
    amount: number
    type: 'income' | 'expense'
  }>
  charts?: {
    trendsData: Array<{ month: string; amount: number }>
    categoryData: Array<{ name: string; value: number }>
  }
}

export class PDFGenerator {
  public generatePDF(data: PDFData): Promise<Blob> {
    return new Promise((resolve) => {
      try {
        // Create HTML content for PDF
        const htmlContent = this.generateHTMLContent(data)
        
        // Create a new window with the HTML content
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          throw new Error('Unable to open print window')
        }

        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            printWindow.close()
            resolve(new Blob(['PDF generated'], { type: 'text/plain' }))
          }, 1000)
        }
      } catch (error) {
        console.error('PDF generation error:', error)
        throw new Error('Failed to generate PDF')
      }
    })
  }

  private generateHTMLContent(data: PDFData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          
          .header .subtitle {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s;
          }
          
          .summary-card.income {
            border-left: 4px solid #10b981;
          }
          
          .summary-card.expense {
            border-left: 4px solid #ef4444;
          }
          
          .summary-card.balance {
            border-left: 4px solid #3b82f6;
          }
          
          .summary-card.savings {
            border-left: 4px solid #8b5cf6;
          }
          
          .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }
          
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section h2 {
            color: #1e293b;
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          
          .category-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .category-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .category-icon {
            font-size: 20px;
          }
          
          .category-name {
            font-weight: 500;
            color: #1e293b;
          }
          
          .category-amount {
            font-weight: bold;
            color: #1e293b;
          }
          
          .category-percentage {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .transactions-table th,
          .transactions-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .transactions-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
          }
          
          .transactions-table .amount {
            font-weight: 500;
          }
          
          .transactions-table .amount.income {
            color: #10b981;
          }
          
          .transactions-table .amount.expense {
            color: #ef4444;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .print-button:hover {
            background: #2563eb;
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Print PDF</button>
        
        <div class="header">
          <h1>${data.title}</h1>
          <div class="subtitle">
            <strong>Period:</strong> ${data.period} | 
            <strong>Generated:</strong> ${data.generatedAt}
          </div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-card income">
            <h3>Total Income</h3>
            <div class="value">$${data.summary.totalIncome.toLocaleString()}</div>
          </div>
          <div class="summary-card expense">
            <h3>Total Expenses</h3>
            <div class="value">$${data.summary.totalExpenses.toLocaleString()}</div>
          </div>
          <div class="summary-card balance">
            <h3>Net Balance</h3>
            <div class="value">$${data.summary.netBalance.toLocaleString()}</div>
          </div>
          <div class="summary-card savings">
            <h3>Savings Rate</h3>
            <div class="value">${data.summary.savingsRate.toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="section">
          <h2>📊 Category Breakdown</h2>
          <div class="categories-grid">
            ${Array.isArray(data.categories) ? data.categories.map(cat => `
              <div class="category-item">
                <div class="category-info">
                  <span class="category-icon">${cat.icon}</span>
                  <div>
                    <div class="category-name">${cat.name}</div>
                    <div class="category-percentage">${cat.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div class="category-amount">$${cat.amount.toLocaleString()}</div>
              </div>
            `).join('') : ''}
          </div>
        </div>
        
        <div class="section">
          <h2>💳 Recent Transactions</h2>
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(data.transactions) ? data.transactions.slice(0, 20).map(transaction => `
                <tr>
                  <td>${transaction.date}</td>
                  <td>${transaction.title}</td>
                  <td>${transaction.category}</td>
                  <td class="amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${Math.abs(transaction.amount).toLocaleString()}
                  </td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Generated by Income & Expense Tracker</p>
          <p>This report was automatically generated on ${data.generatedAt}</p>
        </div>
      </body>
      </html>
    `
  }

  public downloadPDF(data: PDFData, filename: string = 'financial-report.pdf') {
    this.generatePDF(data).then(() => {
      // The PDF will be generated and opened for printing
      // User can save it as PDF from the print dialog
    })
  }
}

// Utility function to format data for PDF
export const formatDataForPDF = (
  analyticsData: any,
  transactionsData: any,
  categoriesData: any,
  period: string
): PDFData => {
  const now = new Date()
  const generatedAt = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const summary = {
    totalIncome: analyticsData?.totalSales || 0,
    totalExpenses: analyticsData?.totalOrders || 0,
    netBalance: (analyticsData?.totalSales || 0) - (analyticsData?.totalOrders || 0),
    savingsRate: analyticsData?.totalSales > 0 
      ? (((analyticsData.totalSales - analyticsData.totalOrders) / analyticsData.totalSales) * 100)
      : 0
  }

  const categories = (categoriesData || []).map((cat: any) => ({
    name: cat._id || cat.name || 'Uncategorized',
    amount: cat.total || cat.amount || 0,
    percentage: cat.percentage || 0,
    icon: cat.icon || '📊',
    color: cat.color || '#3B82F6'
  }))

  const transactions = (transactionsData || []).slice(0, 50).map((transaction: any) => ({
    date: new Date(transaction.date || new Date()).toLocaleDateString(),
    title: transaction.title || transaction.description || 'Transaction',
    category: transaction.category?.name || transaction.category || 'Uncategorized',
    amount: transaction.amount || 0,
    type: transaction.type || 'expense'
  }))

  return {
    title: 'Financial Report',
    period: period.charAt(0).toUpperCase() + period.slice(1),
    generatedAt,
    summary,
    categories,
    transactions
  }
}