'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAPI, categoriesAPI } from '@/lib/api'
import { ArrowLeft, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Transaction } from '@/types'

export default function EditTransactionPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const transactionId = params.id as string

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: '',
  })

  // Fetch transaction data
  const { data: transaction, isLoading: transactionLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionsAPI.getTransaction(transactionId),
    select: (response) => response.data.data,
    enabled: !!transactionId,
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getCategories(),
    select: (response) => response.data.data.categories,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []

  // Update form when transaction data loads
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        description: transaction.description || '',
        amount: transaction.amount?.toString() || '',
        type: transaction.type || 'expense',
        category: transaction.category?._id || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
      })
    }
  }, [transaction])

  // Update mutation
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

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
    }

    updateMutation.mutate(submitData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (transactionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Transaction not found</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
          <p className="text-gray-600">Update transaction details</p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter transaction title"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Enter transaction description"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="input pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary btn-md"
                disabled={updateMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-md"
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
