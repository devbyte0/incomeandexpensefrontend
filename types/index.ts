export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  currency: string
  timezone: string
  preferences: {
    theme: 'light' | 'dark'
    notifications: {
      email: boolean
      push: boolean
      weeklyReport: boolean
    }
    budgetAlerts: boolean
  }
  isEmailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  description?: string
  isDefault: boolean
  isActive: boolean
  user: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  _id: string
  title: string
  description?: string
  amount: number
  type: 'income' | 'expense'
  category: Category
  user: string
  date: string
  tags: string[]
  location?: {
    name: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  attachments: Array<{
    filename: string
    url: string
    mimetype: string
    size: number
  }>
  isRecurring: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    nextDueDate?: string
  }
  status: 'completed' | 'pending' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionSummary {
  income: {
    total: number
    count: number
    average: number
  }
  expense: {
    total: number
    count: number
    average: number
  }
  net: number
}

export interface DashboardAnalytics {
  summary: TransactionSummary
  categoryBreakdown: Array<{
    categoryName: string
    categoryIcon: string
    categoryColor: string
    categoryType: 'income' | 'expense'
    total: number
    count: number
  }>
  monthlyTrends: Array<{
    _id: {
      year: number
      month: number
      type: 'income' | 'expense'
    }
    total: number
  }>
  topCategories: Array<{
    categoryName: string
    categoryIcon: string
    categoryColor: string
    categoryType: 'income' | 'expense'
    total: number
    count: number
  }>
  period: {
    startDate: string
    endDate: string
    type: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: Array<{
    field: string
    message: string
  }>
}

export interface PaginationInfo {
  current: number
  pages: number
  total: number
  limit: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    [key: string]: T[]
  } & {
    pagination: PaginationInfo
  }
}

export interface ChartData {
  _id: {
    year: number
    month: number
    type: 'income' | 'expense'
  }
  total: number
}