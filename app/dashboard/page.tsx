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
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'
import { useAuth } from '@/contexts/AuthContext'
import type { Transaction, ChartData } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const res = await analyticsAPI.getDashboard({ period: 'month' })
      return res.data.data
    },
  })

  // Fetch recent transactions
  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const res = await transactionsAPI.getRecent({ limit: 5 })
      return res.data.data.transactions
    },
  })

  if (analyticsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const summary = analytics?.summary
  const categoryBreakdown = Array.isArray(analytics?.categoryBreakdown) ? analytics.categoryBreakdown : []
  const monthlyTrends = Array.isArray(analytics?.monthlyTrends) ? analytics.monthlyTrends : []

  // Prepare chart data
  const chartData: ChartData[] = monthlyTrends.map((trend: any) => ({
    _id: trend._id,
    total: trend.total,
  }))

  return (
    <div className="space-y-6 relative">
      {/* Background */}
      {user?.preferences?.theme === 'light' && <DaySkyAnimation />}
      {user?.preferences?.theme === 'dark' && <StarfieldBackground />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income */}
        <Card icon={<TrendingUp className="h-5 w-5 text-success-600 dark:text-success-400" />} bg="success" title="Total Income" amount={summary?.income?.total} />
        {/* Expenses */}
        <Card icon={<TrendingDown className="h-5 w-5 text-danger-600 dark:text-danger-400" />} bg="danger" title="Total Expenses" amount={summary?.expense?.total} />
        {/* Net */}
        <Card
          icon={<DollarSign className={`h-5 w-5 ${(summary?.net || 0) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`} />}
          bg={(summary?.net || 0) >= 0 ? 'success' : 'danger'}
          title="Net Balance"
          amount={summary?.net}
        />
        {/* Transactions */}
        <Card icon={<CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-300" />} bg="primary" title="Transactions" amount={(summary?.income?.count || 0) + (summary?.expense?.count || 0)} />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Trends" subtitle="Income vs Expenses this month">
          <DashboardChart data={chartData} />
        </ChartCard>
        <ChartCard title="Recent Transactions" subtitle="Your latest financial activity">
          <RecentTransactions transactions={recentTransactions || []} />
        </ChartCard>
      </div>

      {/* Category Breakdown */}
      <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Category Breakdown</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Spending by category this month</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.slice(0, 6).map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: category.categoryColor }}>
                    {category.categoryIcon}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{category.categoryName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${category.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Card component
function Card({ icon, bg, title, amount }: { icon: JSX.Element; bg: string; title: string; amount?: number }) {
  const bgMap: Record<string, string> = {
    success: 'bg-success-100 dark:bg-success-800',
    danger: 'bg-danger-100 dark:bg-danger-800',
    primary: 'bg-primary-100 dark:bg-primary-800',
  }

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="card-content flex items-center">
        <div className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${bgMap[bg]}`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${amount?.toLocaleString() ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

// ChartCard wrapper
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="card-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </div>
      <div className="card-content">{children}</div>
    </div>
  )
}
