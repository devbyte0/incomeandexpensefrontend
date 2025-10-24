'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI, transactionsAPI } from '@/lib/api'
import { 
  Download, 
  Calendar, 
  Filter, 
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [reportType, setReportType] = useState('summary')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['reports-dashboard', selectedPeriod],
    queryFn: () => analyticsAPI.getDashboard({ period: selectedPeriod }),
    select: (response) => response.data.data,
  })

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['reports-trends', selectedPeriod],
    queryFn: () => analyticsAPI.getTrends({ period: selectedPeriod }),
    select: (response) => response.data.data,
  })

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['reports-categories', selectedPeriod],
    queryFn: () => analyticsAPI.getCategories({ period: selectedPeriod }),
    select: (response) => response.data.data,
  })

  const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
    queryKey: ['reports-comparison'],
    queryFn: () => analyticsAPI.getComparison(),
    select: (response) => response.data.data,
  })

  if (dashboardLoading || trendsLoading || categoryLoading || comparisonLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const summary = dashboardData?.summary
  const trends = trendsData?.trends || []
  const categoryAnalysis = categoryData?.categoryAnalysis || []
  const comparison = comparisonData?.comparison

  // Prepare chart data
  const trendsChartData = trends.map((item: any) => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    amount: item.total,
    count: item.count
  }))

  const pieChartData = categoryAnalysis.slice(0, 6).map((category: any) => ({
    name: category.categoryName,
    value: category.total,
    color: category.categoryColor
  }))

  const COLORS = pieChartData.map((item: any) => item.color)

  const exportReport = () => {
    // In a real app, this would generate and download a PDF/CSV
    toast.success('Report export feature coming soon!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate detailed financial reports and insights</p>
          </div>
          <button
            onClick={exportReport}
            className="btn btn-primary btn-md inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input w-full"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input w-full"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="comparison">Comparison Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </div>
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
                <DollarSign className={`h-6 w-6 ${
                  (summary?.net || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary-600 mt-1">
                  {summary?.income.total > 0 
                    ? ((summary.net / summary.income.total) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Of total income
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Comparison */}
        {comparison && (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Comparison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Income Change</p>
                <div className={`text-2xl font-bold ${
                  comparison.income.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {comparison.income.change > 0 ? '+' : ''}{comparison.income.change}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${comparison.income.current.toLocaleString()} vs ${comparison.income.previous.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Expense Change</p>
                <div className={`text-2xl font-bold ${
                  comparison.expense.changeType === 'increase' ? 'text-danger-600' : 'text-success-600'
                }`}>
                  {comparison.expense.change > 0 ? '+' : ''}{comparison.expense.change}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${comparison.expense.current.toLocaleString()} vs ${comparison.expense.previous.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Net Change</p>
                <div className={`text-2xl font-bold ${
                  comparison.net.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {comparison.net.change > 0 ? '+' : ''}{comparison.net.change}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${comparison.net.current.toLocaleString()} vs ${comparison.net.previous.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends Chart */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Trends</h3>
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
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Category Analysis */}
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
                {categoryAnalysis.map((category: any, index: number) => (
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
