'use client'
import Cookies from 'js-cookie'
import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, Save, User, Mail, Phone, Globe, Bell, Shield, Edit3, Sun, Moon, DollarSign, CheckCircle, XCircle, Send, KeyRound } from 'lucide-react'
import ProfileAvatarCropper from '@/components/ProfileAvatarCropper'
import toast from 'react-hot-toast'
import { User as UserType } from '@/types'
import { authAPI, usersAPI } from '@/lib/api'

type ProfileForm = {
  name: string
  email: string
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
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailChangeOTP, setEmailChangeOTP] = useState('')
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)
  const [resendingEmailChangeOTP, setResendingEmailChangeOTP] = useState(false)
  const [formData, setFormData] = useState<ProfileForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currency: user?.currency || 'AUD',
    timezone: user?.timezone || 'UTC',
    preferences: {
      theme: user?.preferences?.theme || 'light',
      notifications: user?.preferences?.notifications || {
        email: true,
        push: true,
        weeklyReport: true,
      },
      budgetAlerts: user?.preferences?.budgetAlerts ?? true,
    }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setSelectedImage(result)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

const handleCropComplete = async (croppedImage: string) => {
  try {
    const blob = await fetch(croppedImage).then(res => res.blob());
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');

    const token = Cookies.get('token'); // ✅ get token from cookie
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      updateUser({ avatar: data.data.avatar });
      toast.success('Avatar updated successfully!');
    } else {
      toast.error(data.message || 'Failed to upload avatar');
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    toast.error('Error uploading avatar');
  } finally {
    setShowCropper(false);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};


  const handleSave = async () => {
    try {
      updateUser(formData)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currency: user?.currency || 'AUD',
      timezone: user?.timezone || 'UTC',
      preferences: {
        theme: user?.preferences?.theme || 'light',
        notifications: user?.preferences?.notifications || {
          email: true,
          push: true,
          weeklyReport: true,
        },
        budgetAlerts: user?.preferences?.budgetAlerts ?? true,
      }
    })
    setIsEditing(false)
  }

  const handleResendVerification = async () => {
    setResendingVerification(true)
    try {
      await authAPI.resendVerification()
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send verification email'
      toast.error(message)
    } finally {
      setResendingVerification(false)
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail) {
      toast.error('Please enter a new email address')
      return
    }
    setEmailChangeLoading(true)
    try {
      await usersAPI.requestEmailChange({ newEmail })
      toast.success('Verification code sent to your new email!')
      setShowEmailChangeModal(false)
      setShowOTPModal(true)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to request email change'
      toast.error(message)
    } finally {
      setEmailChangeLoading(false)
    }
  }

  const handleVerifyEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (emailChangeOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    setEmailChangeLoading(true)
    try {
      const response = await usersAPI.verifyEmailChange({ otp: emailChangeOTP })
      toast.success('Email updated successfully!')
      setShowOTPModal(false)
      setEmailChangeOTP('')
      setNewEmail('')
      // Reload user data to reflect new email
      window.location.reload()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code'
      toast.error(message)
    } finally {
      setEmailChangeLoading(false)
    }
  }

  const handleResendEmailChangeOTP = async () => {
    setResendingEmailChangeOTP(true)
    try {
      await usersAPI.requestEmailChange({ newEmail })
      toast.success('Verification code resent!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend verification code'
      toast.error(message)
    } finally {
      setResendingEmailChangeOTP(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 relative z-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-primary btn-md flex items-center"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative z-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
        
        <div className="flex items-start space-x-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 transition-colors"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {user.isEmailVerified ? (
                <span className="inline-flex items-center text-green-600 dark:text-green-400" title="Email verified">
                  <CheckCircle className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex items-center text-red-600 dark:text-red-400" title="Email not verified">
                  <XCircle className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Address <div className="flex items-center space-x-2 ml-1 ">
                {user.isEmailVerified ? (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />

                  </span>
                ) : (
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                   
                  </span>
                )}
              </div>
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
              
              {!user.isEmailVerified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center disabled:opacity-50"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {resendingVerification ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowEmailChangeModal(true)}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
              >
                <KeyRound className="h-3 w-3 mr-1" />
                Change Email
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="AUD">A$ Australian Dollar (AUD)</option>
                <option value="CAD">C$ Canadian Dollar (CAD)</option>
                <option value="JPY">¥ Japanese Yen (JPY)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative z-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Preferences</h2>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Theme
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setFormData({ 
                  ...formData, 
                  preferences: { 
                    ...formData.preferences, 
                    theme: 'light' 
                  } 
                })}
                disabled={!isEditing}
                className={`flex items-center px-4 dark:text-gray-100 py-2 rounded-lg border-2 transition-colors ${
                  formData.preferences.theme === 'light' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                Light
              </button>
              <button
                onClick={() => setFormData({ 
                  ...formData, 
                  preferences: { 
                    ...formData.preferences, 
                    theme: 'dark' 
                  } 
                })}
                disabled={!isEditing}
                className={`flex items-center dark:text-gray-100 px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.preferences.theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Moon className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                Dark
              </button>
            </div>
          </div>

          {/* Budget Alerts */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Budget Alerts
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get notified when approaching budget limits</p>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.budgetAlerts}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    budgetAlerts: e.target.checked
                  }
                })}
                disabled={!isEditing}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.preferences.budgetAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.preferences.budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="btn btn-primary btn-md flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Change Email Address
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your new email address. A verification code will be sent to confirm the change.
            </p>
            
            <form onSubmit={handleRequestEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input w-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input w-full dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter new email address"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailChangeModal(false)
                    setNewEmail('')
                  }}
                  className="btn btn-secondary btn-md flex-1 dark:bg-gray-700 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailChangeLoading}
                  className="btn btn-primary btn-md flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-gray-100 disabled:opacity-50"
                >
                  {emailChangeLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Change OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Verify New Email
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              We've sent a 6-digit verification code to <strong>{newEmail}</strong>. Please enter it below.
            </p>
            
            <form onSubmit={handleVerifyEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={emailChangeOTP}
                  onChange={(e) => setEmailChangeOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="input w-full text-center text-2xl tracking-widest dark:bg-gray-700 dark:text-gray-100"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendEmailChangeOTP}
                  disabled={resendingEmailChangeOTP}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
                >
                  {resendingEmailChangeOTP ? 'Sending...' : 'Resend Code'}
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPModal(false)
                    setEmailChangeOTP('')
                    setNewEmail('')
                  }}
                  className="btn btn-secondary btn-md flex-1 dark:bg-gray-700 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailChangeLoading || emailChangeOTP.length !== 6}
                  className="btn btn-primary btn-md flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-gray-100 disabled:opacity-50"
                >
                  {emailChangeLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Cropper Modal */}
      {showCropper && selectedImage && (
        <ProfileAvatarCropper
          image={selectedImage}
          onCrop={handleCropComplete}
          onClose={() => {
            setShowCropper(false)
            setSelectedImage(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
        />
      )}
    </div>
  )
}