'use client'

import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      name: 'Add Income',
      href: '/dashboard/transactions/new?type=income',
      icon: TrendingUp,
      color: 'bg-success-500 hover:bg-success-600',
      description: 'Record new income'
    },
    {
      name: 'Add Expense',
      href: '/dashboard/transactions/new?type=expense',
      icon: TrendingDown,
      color: 'bg-danger-500 hover:bg-danger-600',
      description: 'Record new expense'
    },
    {
      name: 'View Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      color: 'bg-primary-500 hover:bg-primary-600',
      description: 'Check your trends'
    },
    {
      name: 'Quick Add',
      href: '/dashboard/transactions/new',
      icon: Plus,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Add any transaction'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:ring-gray-300 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 rounded-lg p-2 text-white transition-colors ${action.color}`}>
              <action.icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                {action.name}
              </p>
              <p className="text-xs text-gray-500">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
