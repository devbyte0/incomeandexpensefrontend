'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesAPI } from '@/lib/api'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Palette,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import toast from 'react-hot-toast'

const categoryIcons = [
  '💰', '💼', '🏠', '🍽️', '🚗', '🛍️', '🎬', '💡', '🏥', '📚', 
  '✈️', '💸', '🎯', '🎨', '🏃', '🎵', '📱', '💻', '☕', '🍕'
]

const categoryColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: '💰',
    color: '#3B82F6',
    description: ''
  })

  const queryClient = useQueryClient()

  const { data: categories, isPending, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getCategories(),
    select: (response) => response.data.data.categories,
    retry: 3,
    retryDelay: 1000,
  })

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => categoriesAPI.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created successfully!')
      setShowAddModal(false)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category')
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesAPI.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully!')
      setEditingCategory(null)
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: '💰',
      color: '#3B82F6',
      description: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory._id, data: formData })
    } else {
      createCategoryMutation.mutate(formData)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      description: category.description || ''
    })
    setShowAddModal(true)
  }

  const handleDelete = (category: any) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category._id)
    }
  }

  const incomeCategories = Array.isArray(categories) ? categories.filter((cat: any) => cat.type === 'income') : []
  const expenseCategories = Array.isArray(categories) ? categories.filter((cat: any) => cat.type === 'expense') : []

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Failed to load categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              We couldn't load your categories. This might be due to a network issue or server problem.
            </p>
            <button
              onClick={() => refetch()}
              className="btn btn-primary btn-md inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Organize your transactions with custom categories</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null)
              resetForm()
              setShowAddModal(true)
            }}
            className="btn btn-primary btn-md inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>

        {/* Income Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-success-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Income Categories</h2>
              <span className="ml-2 bg-success-100 text-success-800 text-xs font-medium px-2 py-1 rounded-full">
                {incomeCategories.length}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No income categories yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Create your first income category to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {incomeCategories.map((category: any) => (
                  <div
                    key={category._id}
                    className="relative group p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      {!category.isDefault && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-1 text-gray-400 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                    )}
                    {category.isDefault && (
                      <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-danger-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expense Categories</h2>
              <span className="ml-2 bg-danger-100 text-danger-800 text-xs font-medium px-2 py-1 rounded-full">
                {expenseCategories.length}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No expense categories yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Create your first expense category to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {expenseCategories.map((category: any) => (
                  <div
                    key={category._id}
                    className="relative group p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      {!category.isDefault && (
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-1 text-gray-400 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{category.description}</p>
                    )}
                    {category.isDefault && (
                      <span className="inline-block mt-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      placeholder="Enter category name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Type
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
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
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-10 gap-2">
                      {categoryIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`p-2 rounded-lg text-lg transition-colors ${
                            formData.icon === icon
                              ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {categoryColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`h-8 w-8 rounded-lg border-2 transition-all ${
                            formData.color === color
                              ? 'border-gray-400 dark:border-gray-300 scale-110'
                              : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      placeholder="Enter category description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                      className="btn btn-primary btn-md flex-1"
                    >
                      {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        editingCategory ? 'Update Category' : 'Create Category'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        setEditingCategory(null)
                        resetForm()
                      }}
                      className="btn btn-secondary btn-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
