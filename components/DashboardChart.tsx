'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  _id: {
    year: number
    month: number
    type: 'income' | 'expense'
  }
  total: number
}

interface DashboardChartProps {
  data: ChartData[]
}

export default function DashboardChart({ data }: DashboardChartProps) {
  // Transform data for the chart
  const chartData = data.reduce((acc: any[], item) => {
    const monthKey = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`
    const existingItem = acc.find(d => d.month === monthKey)
    
    if (existingItem) {
      existingItem[item._id.type] = item.total
    } else {
      acc.push({
        month: monthKey,
        [item._id.type]: item.total,
        income: item._id.type === 'income' ? item.total : 0,
        expense: item._id.type === 'expense' ? item.total : 0,
      })
    }
    
    return acc
  }, [])

  // Sort by month
  chartData.sort((a, b) => a.month.localeCompare(b.month))

  // Format month labels
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Start adding transactions to see your trends</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            labelFormatter={(value) => `Month: ${formatMonth(value)}`}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name === 'income' ? 'Income' : 'Expenses'
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
