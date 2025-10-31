'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAPI, categoriesAPI } from '@/lib/api'
import { ArrowLeft, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'

export default function EditTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const transactionId = params.id as string


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: '',
  })

const { data: transaction, isLoading: transactionLoading } = useQuery({
  queryKey: ['transaction', transactionId],
  queryFn: () => transactionsAPI.getTransaction(transactionId),
  select: (res) => res.data.data.transaction, // ✅ extract the actual transaction object
  enabled: !!transactionId,
})

  console.log(transaction)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getCategories(),
    select: (res) => res.data.data.categories,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []

useEffect(() => {
  if (transaction) {
    console.log('Loaded transaction:', transaction)
    setFormData({
      title: transaction.title || '',
      description: transaction.description || '',
      amount: transaction.amount ? transaction.amount.toString() : '',
      type: transaction.type || 'expense',
      category:
        typeof transaction.category === 'object'
          ? transaction.category._id
          : transaction.category || '',
      date: transaction.date
        ? new Date(transaction.date).toISOString().split('T')[0]
        : '',
    })
  }
}, [transaction])

  const updateMutation = useMutation({
    mutationFn: (data: any) => transactionsAPI.updateTransaction(transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] })
      toast.success('Transaction updated successfully')
      router.push('/dashboard/transactions')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.category || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    updateMutation.mutate({ ...formData, amount: parseFloat(formData.amount) })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const themeClasses = {
    bg: 'bg-gray-50 dark:bg-gray-900',
    cardBg: 'bg-white dark:bg-gray-800',
    text: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    inputBg: 'bg-white dark:bg-gray-700',
    hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-700',
  }

  if (transactionLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${themeClasses.bg}`}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className={`text-center py-12 ${themeClasses.bg}`}>
        <p className={`${themeClasses.textSecondary} text-lg mb-4`}>Transaction not found</p>
        <button
          onClick={() => router.push('/dashboard/transactions')}
          className="btn btn-primary btn-md"
        >
          Back to Transactions
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 ${themeClasses.bg} min-h-screen relative`}>
      {/* Background Animations */}
      {user?.preferences?.theme === 'light' && <DaySkyAnimation />}
      {user?.preferences?.theme === 'dark' && <StarfieldBackground />}
      
      {/* Header */}
      <div className="flex items-center space-x-4 relative z-10">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-lg transition-colors ${themeClasses.hoverBg}`}
        >
          <ArrowLeft className={`h-5 w-5 ${themeClasses.text}`} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Edit Transaction</h1>
          <p className={`${themeClasses.textSecondary}`}>Update transaction details</p>
        </div>
      </div>

      {/* Form */}
      <div className={`card ${themeClasses.cardBg} border ${themeClasses.border} rounded-xl shadow-sm relative z-10`}>
        <div className="card-content p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className={`block text-sm font-medium mb-2 ${themeClasses.text} dark:text-gray-200`}>
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input w-full ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
                  placeholder="Enter transaction title"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className={`block text-sm font-medium mb-2 ${themeClasses.text} dark:text-gray-200`}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`input w-full ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
                  placeholder="Enter transaction description"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${themeClasses.text} dark:text-gray-200`}>
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`${themeClasses.textSecondary} sm:text-sm`}>$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`input w-full pl-7 ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className={`block text-sm font-medium mb-2 ${themeClasses.text} dark:text-gray-200`}>
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`input w-full ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className={`block text-sm font-medium mb-2 ${themeClasses.text} dark:text-gray-200`}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input w-full ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((cat: any) => cat.type === formData.type)
                    .map((category: any) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className={`block text-sm font-medium mb-2 ${themeClasses.text} dark:text-gray-200`}>
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`input w-full ${themeClasses.inputBg} ${themeClasses.text} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400`}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className={`btn btn-secondary btn-md flex items-center ${themeClasses.hoverBg}`}
                disabled={updateMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary btn-md flex items-center`}
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Updating...' : 'Update Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
