'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TabBar from '@/components/TabBar'
import Header from '@/components/Header'
import StarfieldBackground from '../../components/StarfieldBackground';
import DaySkyAnimation from '../../components/DaySkyAnimation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Background Animations */}
      {user?.preferences?.theme === 'light' && <DaySkyAnimation />}
      {user?.preferences?.theme === 'dark' && <StarfieldBackground />}
      
      <div className="relative z-10 min-h-screen bg-gray-50 dark:bg-gray-900">
        <TabBar />
        <div className="lg:pl-64">
          <Header />
          <main className="py-4 sm:py-6 pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
