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
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedType, setSelectedType] = useState('sales')

  // ✅ Dashboard Query
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard', selectedPeriod],
    queryFn: () => analyticsAPI.getDashboard({ period: selectedPeriod }),
    select: (response: AxiosResponse<{ data: DashboardResponse }>) =>
      response.data.data,
  })

  // ✅ Trends Query
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics-trends', selectedPeriod, selectedType],
    queryFn: () =>
      analyticsAPI.getTrends({ period: selectedPeriod, type: selectedType }),
    select: (response: AxiosResponse<{ data: TrendItem[] }>) =>
      response.data.data,
  })

  // ✅ Categories Query
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['analytics-categories', selectedPeriod],
    queryFn: () => analyticsAPI.getCategories({ period: selectedPeriod }),
    select: (response: AxiosResponse<{ data: CategoryItem[] }>) =>
      response.data.data,
  })

  if (dashboardLoading || trendsLoading || categoryLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    )
  }

  // ✅ Prepare chart data safely with proper types
  const trendsChartData = (trendsData || []).map((item: TrendItem) => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    amount: item.total,
    count: item.count,
  }))

  const categoryChartData = (categoryData || []).map((item: CategoryItem) => ({
    category: item._id,
    total: item.total,
  }))

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* === Dashboard Summary === */}
      {dashboardData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Total Sales</p>
            <p className="text-2xl font-semibold">${dashboardData.totalSales}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Total Orders</p>
            <p className="text-2xl font-semibold">{dashboardData.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold">{dashboardData.totalUsers}</p>
          </div>
        </div>
      )}

      {/* === Trends Chart === */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sales Trends</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendsChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === Category Chart === */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
