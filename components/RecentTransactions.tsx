'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Transaction } from '@/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No recent transactions</p>
        <Link
          href="/dashboard/transactions/new"
          className="btn btn-primary btn-sm"
        >
          Add Transaction
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: transaction.category.color }}
            >
              <span className="text-lg">{transaction.category.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{transaction.title}</p>
              <p className="text-xs text-gray-500">
                {transaction.category.name} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${
              transaction.type === 'income' ? 'text-success-600' : 'text-danger-600'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">
                ${transaction.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-3 border-t border-gray-200">
        <Link
          href="/dashboard/transactions"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          View all transactions →
        </Link>
      </div>
    </div>
  )
}
