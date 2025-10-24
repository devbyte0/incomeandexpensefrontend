'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { AxiosResponse } from 'axios'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'
import { useAuth } from '@/contexts/AuthContext'
import PDFGeneratorComponent from '@/components/PDFGenerator'

type DashboardResponse = {
  totalSales: number
  totalOrders: number
  totalUsers: number
}

type TrendItem = {
  _id: { year: number; month: number }
  total: number
  count: number
}

type CategoryItem = {
  _id: string
  total: number
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedType, setSelectedType] = useState('sales')

  // ✅ Dashboard Query
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['analytics-dashboard', selectedPeriod],
    queryFn: () => analyticsAPI.getDashboard({ period: selectedPeriod }),
    select: (response: AxiosResponse<{ data: DashboardResponse }>) =>
      response.data.data,
    retry: 2,
    retryDelay: 1000,
  })

  // ✅ Trends Query
  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useQuery({
    queryKey: ['analytics-trends', selectedPeriod, selectedType],
    queryFn: () =>
      analyticsAPI.getTrends({ period: selectedPeriod, type: selectedType }),
    select: (response: AxiosResponse<{ data: TrendItem[] }>) =>
      response.data.data,
    retry: 2,
    retryDelay: 1000,
  })

  // ✅ Categories Query
  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ['analytics-categories', selectedPeriod],
    queryFn: () => analyticsAPI.getCategories({ period: selectedPeriod }),
    select: (response: AxiosResponse<{ data: CategoryItem[] }>) =>
      response.data.data,
    retry: 2,
    retryDelay: 1000,
  })

  if (dashboardLoading || trendsLoading || categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if there are critical errors
  if (dashboardError || trendsError || categoryError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Analytics temporarily unavailable
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              We're having trouble loading your analytics data. Please try refreshing the page or come back later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-md inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Prepare chart data safely with proper types and error handling
  const trendsChartData = Array.isArray(trendsData) ? trendsData.map((item: TrendItem) => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    amount: item.total,
    count: item.count,
  })) : []

  const categoryChartData = Array.isArray(categoryData) ? categoryData.map((item: CategoryItem) => ({
    category: item._id,
    total: item.total,
  })) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative">
      {/* Background Animations */}
      {user?.preferences?.theme === 'light' && <DaySkyAnimation />}
      {user?.preferences?.theme === 'dark' && <StarfieldBackground />}
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Track your financial performance and trends</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <PDFGeneratorComponent
              analyticsData={dashboardData}
              transactionsData={trendsData}
              categoriesData={categoryData}
              period={selectedPeriod}
              variant="dropdown"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

      {/* === Dashboard Summary === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Total Sales</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            ${dashboardData?.totalSales || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {dashboardData?.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {dashboardData?.totalUsers || 0}
          </p>
        </div>
      </div>

      {/* === Trends Chart === */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sales Trends</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {trendsChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No trend data available</p>
              <p className="text-sm">Try selecting a different time period</p>
            </div>
          </div>
        )}
      </div>

      {/* === Category Chart === */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Categories</h2>
        {categoryChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p>No category data available</p>
              <p className="text-sm">Create some transactions to see category analytics</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
