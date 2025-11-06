'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAPI } from '@/lib/api'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Download,
} from 'lucide-react'
import { Transaction } from '@/types'
import toast from 'react-hot-toast'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'
import { useAuth } from '@/contexts/AuthContext'
import ViewTransactionModal from '@/components/ViewTransactionModal'
import { PDFGenerator, formatDataForPDF } from '@/lib/pdfService'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null)

  const queryClient = useQueryClient()

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsAPI.getTransactions(filters),
    select: (response) => response.data.data,
  })

  const transactions = transactionsData?.transactions || []
  const pagination = transactionsData?.pagination

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsAPI.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transaction deleted successfully')
      setDeleteConfirm(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction')
    },
  })

  const handleDelete = (id: string) => deleteMutation.mutate(id)
  const handleView = (transaction: Transaction) => setViewTransaction(transaction)

  const handleFilterChange = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))

  const handleClearFilters = () =>
    setFilters({ search: '', type: '', startDate: '', endDate: '', page: 1, limit: 20 })

  const handlePrintPDF = () => {
    if (!transactions.length) {
      toast.error('No transactions to print')
      return
    }
    const categoriesData = Array.isArray(transactions)
  ? transactions.map(t => t.category)
  : [];
console.log(categoriesData);


   const pdfData = formatDataForPDF(
  null,
  transactions,
  categoriesData,
  'custom date range'
)

    const generator = new PDFGenerator()
    generator.generatePDF(pdfData)
  }

  return (
    <div className="space-y-6 relative">
     

      {/* Header Section */}


      {/* Filters */}
<div className="card bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm p-4 grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">

  {/* Search */}
  <div className="relative col-span-1 md:col-span-2 w-full">
    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search transactions..."
      className="input pl-10 w-full  dark:text-gray-100 dark:bg-gray-700/50"
      value={filters.search}
      onChange={(e) => handleFilterChange('search', e.target.value)}
    />
  </div>

  {/* Title & Actions */}
  <div className="col-span-1 md:col-span-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 w-full">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Transactions
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Manage your income and expenses
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {/* Print PDF Button */}
      <button
        onClick={handlePrintPDF}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        <Download className="h-4 w-4" />
        Print PDF
      </button>

      {/* Add Transaction Button */}
      <Link
        href="/dashboard/transactions/new"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        <Plus className="h-4 w-4" />
        Add Transaction
      </Link>
    </div>
  </div>

  {/* Type Filter */}
  <select
    className="input col-span-1 md:col-span-1 w-full dark:bg-gray-700/50 dark:text-gray-100"
    value={filters.type}
    onChange={(e) => handleFilterChange('type', e.target.value)}
  >
    <option value="">All Types</option>
    <option value="income">Income</option>
    <option value="expense">Expense</option>
  </select>

  {/* Date Filters */}
  <input
    type="date"
    className="input col-span-1 md:col-span-1 w-full dark:text-gray-100 dark:bg-gray-700/50"
    value={filters.startDate}
    onChange={(e) => handleFilterChange('startDate', e.target.value)}
  />
  <input
    type="date"
    className="input col-span-1 md:col-span-1 w-full dark:text-gray-100 dark:bg-gray-700/50 "
    value={filters.endDate}
    onChange={(e) => handleFilterChange('endDate', e.target.value)}
  />

  {/* Clear Filters Button */}
  <button
    onClick={handleClearFilters}
    className="btn btn-secondary btn-md col-span-1 md:col-span-1 w-full "
  >
    Clear Filters
  </button>

</div>


      {/* Table */}
      <div className="card bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No transactions found</p>
              <Link href="/dashboard/transactions/new" className="btn btn-primary btn-md">
                Add Your First Transaction
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {transactions.map((transaction: Transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{transaction.title}</div>
                          {transaction.description && (
                            <div className="text-sm text-gray-500 truncate">{transaction.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 flex items-center">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white mr-3"
                            style={{ backgroundColor: transaction.category.color }}
                          >
                            {transaction.category.icon}
                          </div>
                          <span className=' dark:text-gray-100'>{transaction.category.name}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          <div
                            className={`flex items-center ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            ${transaction.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500  dark:text-gray-100">{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button onClick={() => handleView(transaction)} className="text-primary-600 hover:text-primary-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link href={`/dashboard/transactions/edit/${transaction._id}`} className="text-gray-600 hover:text-gray-900">
                            <Edit className="h-4 w-4  dark:text-gray-100" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(transaction._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden space-y-4 p-4">
                {transactions.map((transaction: Transaction) => (
                  <div key={transaction._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900">{transaction.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-gray-700">{transaction.category.name}</p>
                    <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      ${transaction.amount.toLocaleString()}
                    </p>
                    <div className="mt-3 flex justify-end space-x-3">
                      <button onClick={() => handleView(transaction)} className="text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href={`/dashboard/transactions/edit/${transaction._id}`} className="text-gray-600">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(transaction._id)}
                        className="text-red-600"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewTransaction && (
        <ViewTransactionModal
          transaction= {viewTransaction}
          onClose={() => setViewTransaction(null)}
        />
      )}
    </div>
  )
}
