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
import { useAuth } from '@/contexts/AuthContext'

// Types
import type { Transaction, ChartData } from '@/types'

// ✅ Define Category Type
type CategoryBreakdown = {
  categoryName: string
  categoryColor: string
  categoryIcon: string
  categoryType: 'income' | 'expense'
  total: number
  count: number
}

export default function DashboardPage() {
  const { user } = useAuth()

  // Fetch analytics data
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
  const categoryBreakdown: CategoryBreakdown[] = Array.isArray(analytics?.categoryBreakdown)
    ? analytics.categoryBreakdown
    : []
  const monthlyTrends = Array.isArray(analytics?.monthlyTrends)
    ? analytics.monthlyTrends
    : []

  // Chart data
  const chartData: ChartData[] = monthlyTrends.map((trend: ChartData) => ({
    _id: trend._id,
    total: trend.total,
  }))

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name || 'User'}! Here’s your financial summary.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income */}
        <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ${summary?.income?.total?.toLocaleString() ?? '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Expense */}
        <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expense</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ${summary?.expense?.total?.toLocaleString() ?? '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center">
            <div
              className={`h-10 w-10 rounded-md flex items-center justify-center ${
                (summary?.net || 0) >= 0
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}
            >
              <DollarSign
                className={`h-5 w-5 ${
                  (summary?.net || 0) >= 0
                    ? 'text-green-600 dark:text-green-300'
                    : 'text-red-600 dark:text-red-300'
                }`}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Net Balance</p>
              <p
                className={`text-2xl font-semibold ${
                  (summary?.net || 0) >= 0
                    ? 'text-green-600 dark:text-green-300'
                    : 'text-red-600 dark:text-red-300'
                }`}
              >
                ${summary?.net?.toLocaleString() ?? '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {(summary?.income?.count || 0) + (summary?.expense?.count || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Trends</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Income vs Expenses this month
            </p>
          </div>
          <DashboardChart data={chartData} />
        </div>

        {/* Recent Transactions */}
        <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your latest activity</p>
          </div>
          <RecentTransactions transactions={recentTransactions || []} />
        </div>
      </div>

      {/* Category Breakdown Section */}
      <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Category Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Spending & income distribution by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.slice(0, 6).map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: category.categoryColor }}
                >
                  {category.categoryIcon}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {category.categoryName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {category.count} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    category.categoryType === 'income'
                      ? 'text-green-600 dark:text-green-300'
                      : 'text-red-600 dark:text-red-300'
                  }`}
                >
                  ${category.total.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
