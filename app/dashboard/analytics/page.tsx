'use client'

import { useState } from 'react'
import { useQuery } from 'react-query'
import { analyticsAPI } from '@/lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedType, setSelectedType] = useState('expense')

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['analytics-dashboard', selectedPeriod],
    () => analyticsAPI.getDashboard({ params: { period: selectedPeriod } }),
    {
      select: (response) => response.data.data,
    }
  )

  const { data: trendsData, isLoading: trendsLoading } = useQuery(
    ['analytics-trends', selectedPeriod, selectedType],
    () => analyticsAPI.getTrends({ params: { period: selectedPeriod, type: selectedType } }),
    {
      select: (response) => response.data.data,
    }
  )

  const { data: categoryData, isLoading: categoryLoading } = useQuery(
    ['analytics-categories', selectedPeriod],
    () => analyticsAPI.getCategories({ params: { period: selectedPeriod } }),
    {
      select: (response) => response.data.data,
    }
  )

  if (dashboardLoading || trendsLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const summary = dashboardData?.summary
  const trends = trendsData?.trends || []
  const categoryAnalysis = categoryData?.categoryAnalysis || []

  // Prepare data for charts
  const trendsChartData = trends.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    amount: item.total,
    count: item.count,
    average: item.average
  }))

  const pieChartData = categoryAnalysis.slice(0, 6).map(category => ({
    name: category.categoryName,
    value: category.total,
    color: category.categoryColor,
    percentage: category.percentage
  }))

  const COLORS = pieChartData.map(item => item.color)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed insights into your financial data</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex flex-wrap gap-2">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl sm:text-3xl font-bold text-success-600 mt-1">
                  ${summary?.income.total.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary?.income.count || 0} transactions
                </p>
              </div>
              <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold text-danger-600 mt-1">
                  ${summary?.expense.total.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary?.expense.count || 0} transactions
                </p>
              </div>
              <div className="h-12 w-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-danger-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Balance</p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 ${
                  (summary?.net || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  ${summary?.net.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary?.income.average ? `Avg: $${summary.income.average.toFixed(0)}` : 'No data'}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                (summary?.net || 0) >= 0 ? 'bg-success-100' : 'bg-danger-100'
              }`}>
                <BarChart3 className={`h-6 w-6 ${
                  (summary?.net || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary-600 mt-1">
                  ${summary?.expense.average ? summary.expense.average.toFixed(0) : '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Per expense
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends Chart */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedType('income')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedType === 'income'
                      ? 'bg-success-100 text-success-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setSelectedType('expense')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedType === 'expense'
                      ? 'bg-danger-100 text-danger-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>
            
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-')
                      return `${month}/${year.slice(2)}`
                    }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(value) => `Month: ${value}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={selectedType === 'income' ? '#10b981' : '#ef4444'} 
                    strokeWidth={2}
                    dot={{ fill: selectedType === 'income' ? '#10b981' : '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
            </div>
            
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Analysis Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Category Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryAnalysis.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm mr-3"
                          style={{ backgroundColor: category.categoryColor }}
                        >
                          {category.categoryIcon}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.categoryName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${category.total.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.count}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${category.average.toFixed(0)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${category.percentage}%`,
                              backgroundColor: category.categoryColor 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{category.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
