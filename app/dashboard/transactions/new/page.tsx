'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesAPI, transactionsAPI } from '@/lib/api'
import { Calendar, DollarSign, FileText, Tag, MapPin } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'
import { useAuth } from '@/contexts/AuthContext'

export default function NewTransactionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: searchParams.get('type') || 'expense',
    category: '',
    date: new Date(),
    description: '',
    tags: '',
    notes: '',
  })

  const [loading, setLoading] = useState(false)

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories', formData.type],
    queryFn: () => categoriesAPI.getCategories({ type: formData.type }),
    select: (response) => response.data.data.categories,
  })

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: any) => transactionsAPI.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      toast.success('Transaction created successfully!')
      router.push('/dashboard/transactions')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      }

      await createTransactionMutation.mutateAsync(transactionData)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type,
      category: '', // Reset category when type changes
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative">
      {/* Background Animations */}
      {user?.preferences?.theme === 'light' && <DaySkyAnimation />}
      {user?.preferences?.theme === 'dark' && <StarfieldBackground />}
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Add New Transaction</h1>
          <p className="text-gray-600 dark:text-gray-300">Record your income or expense</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Transaction Type
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-2 border-green-300 dark:border-green-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              💰 Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-2 border-red-300 dark:border-red-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              💸 Expense
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="input bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            placeholder="Enter transaction title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="0.01"
              step="0.01"
              className="input pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            className="input bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {Array.isArray(categories) ? categories.map((category: any) => (
              <option key={category._id} value={category._id} className="bg-white dark:bg-gray-800">
                {category.icon} {category.name}
              </option>
            )) : null}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Date *
          </label>
          <div className="relative">
            {/* @ts-ignore */}
            <DatePicker
              selected={formData.date}
              onChange={(date: Date) => setFormData({ ...formData, date })}
              dateFormat="MMM dd, yyyy"
              className="input w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholderText="Select date"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="input bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            placeholder="Optional description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tags
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="tags"
              name="tags"
              className="input pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="food, business, travel (comma separated)"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="input bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            placeholder="Additional notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg flex-1"
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Create Transaction'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary btn-lg"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}
