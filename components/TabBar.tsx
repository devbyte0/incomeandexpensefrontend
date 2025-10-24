'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Plus, 
  BarChart3, 
  CreditCard, 
  User,
  MoreHorizontal,
  PieChart,
  FileText,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import clsx from 'clsx'
import { useState } from 'react'

// Main navigation items (always visible)
const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Add', href: '/dashboard/transactions/new', icon: Plus },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
]

// Additional navigation items (in dropdown)
const additionalNavigation = [
  { name: 'Categories', href: '/dashboard/categories', icon: PieChart },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function TabBar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  return (
    <>
      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <item.icon className={clsx(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-primary-600' : 'text-gray-500'
                )} />
                <span className={clsx(
                  'text-xs font-medium',
                  isActive ? 'text-primary-600' : 'text-gray-500'
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
          
          {/* More menu */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={clsx(
                'flex flex-col items-center justify-center w-full py-2 px-1 transition-colors',
                showMoreMenu ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <MoreHorizontal className={clsx(
                'h-5 w-5 mb-1',
                showMoreMenu ? 'text-primary-600' : 'text-gray-500'
              )} />
              <span className={clsx(
                'text-xs font-medium',
                showMoreMenu ? 'text-primary-600' : 'text-gray-500'
              )}>
                More
              </span>
            </button>

            {/* More menu dropdown */}
            {showMoreMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto min-w-[200px]">
                  <div className="py-2">
                    {additionalNavigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            'flex items-center px-4 py-3 text-sm transition-colors',
                            isActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                          onClick={() => setShowMoreMenu(false)}
                        >
                          <item.icon className={clsx(
                            'mr-3 h-4 w-4',
                            isActive ? 'text-primary-500' : 'text-gray-400'
                          )} />
                          {item.name}
                        </Link>
                      )
                    })}
                    
                    {/* Logout */}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowMoreMenu(false)
                          logout()
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="mr-3">🚪</span>
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <img src="/Income&Expence.png" alt="Income & Expense Logo" className="h-10 w-auto rounded-full" />
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <span className="text-primary-600 font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {[...mainNavigation, ...additionalNavigation].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <span className="mr-3">🚪</span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
