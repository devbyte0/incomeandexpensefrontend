'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, transactionsAPI } from '@/lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard 
} from 'lucide-react'
import DashboardChart from '@/components/DashboardChart'
import RecentTransactions from '@/components/RecentTransactions'
import QuickActions from '@/components/QuickActions'

// Import your types
import type { Transaction, ChartData } from '@/types'

export default function DashboardPage() {
  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await analyticsAPI.getDashboard({ period: 'month' })
      return res.data.data
    }
  })

  // Fetch recent transactions
  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const res = await transactionsAPI.getRecent({ limit: 5 })
      return res.data.data.transactions.map((tx: Transaction) => ({
        _id: tx._id,
        title: tx.title || '',
        user: tx.user || '',
        tags: tx.tags || [],
        attachments: tx.attachments || [],
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
      }))
    }
  })

  if (analyticsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const summary = analytics?.summary
  const categoryBreakdown = analytics?.categoryBreakdown || []
  const monthlyTrends = analytics?.monthlyTrends || []

  // Transform monthlyTrends to match ChartData type
  const chartData: ChartData[] = monthlyTrends.map((trend: ChartData) => ({
    _id: trend._id,
    total: trend.total,
  }))

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-success-100 dark:bg-success-800 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success-600 dark:text-success-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  ${summary?.income.total.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-danger-100 dark:bg-danger-800 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  ${summary?.expense.total.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-md flex items-center justify-center ${(summary?.net || 0) >= 0 ? 'bg-success-100 dark:bg-success-800' : 'bg-danger-100 dark:bg-danger-800'}`}>
                  <DollarSign className={`h-5 w-5 ${(summary?.net || 0) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
                <p className={`text-2xl font-semibold ${(summary?.net || 0) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                  ${summary?.net.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Count */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {(summary?.income.count || 0) + (summary?.expense.count || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Trends</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Income vs Expenses this month</p>
          </div>
          <div className="card-content">
            <DashboardChart data={chartData} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your latest financial activity</p>
          </div>
          <div className="card-content">
            <RecentTransactions transactions={recentTransactions || []} />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Category Breakdown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Spending by category this month</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.slice(0, 6).map((category: {
              categoryName: string;
              categoryIcon: string;
              categoryColor: string;
              categoryType: 'income' | 'expense';
              total: number;
              count: number;
            }, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: category.categoryColor }}
                  >
                    {category.categoryIcon}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.categoryName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${category.total.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
