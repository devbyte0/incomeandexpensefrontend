'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Detect theme from system preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setVerificationStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setVerificationStatus('success')
          setMessage('Your email has been verified successfully!')
        } else {
          setVerificationStatus('error')
          setMessage(data.message || 'Email verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setVerificationStatus('error')
        setMessage('Failed to verify email. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('Verification email sent successfully!')
      } else {
        setMessage(data.message || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setMessage('Failed to send verification email. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Animations */}
      {theme === 'light' && <DaySkyAnimation />}
      {theme === 'dark' && <StarfieldBackground />}
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Email Verification
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center">
            {verificationStatus === 'loading' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Verifying your email...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Email Verified Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/auth/login"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Verification Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleResendVerification}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </button>
                  <Link
                    href="/auth/register"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Register Again
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{' '}
            <a href="mailto:support@incomeexpense.com" className="font-medium text-primary-600 hover:text-primary-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
