'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Palette,
  Bell,
  Save,
  Edit,
  Sun,
  Moon
} from 'lucide-react'
import toast from 'react-hot-toast'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'
import ProfileAvatarCropper from '@/components/ProfileAvatarCropper';

function setThemeClass(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currency: user?.currency || 'USD',
    timezone: user?.timezone || 'UTC'
  })

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'light',
    budgetAlerts: user?.preferences?.budgetAlerts ?? true
  })

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => usersAPI.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.data.user)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => usersAPI.updatePreferences(data),
    onSuccess: (response) => {
      updateUser(response.data.data.user)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Preferences updated successfully!')
    },
    onError: (error: any) => {
      console.error('Preferences update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update preferences')
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({ ...formData, avatar: croppedAvatar || user?.avatar })
  }

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferencesMutation.mutate({ preferences })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePreferenceChange = (path: string, value: any) => {
    if (path === 'theme') {
      setThemeClass(value);
    }
    if (path.includes('.')) {
      const [parent, child] = path.split('.')
      setPreferences({
        ...preferences,
        [parent]: {
          ...(preferences as any)[parent],
          [child]: value
        }
      })
    } else {
      setPreferences({
        ...preferences,
        [path]: value
      })
    }
  }

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarSrc(ev.target?.result as string ?? null);
      reader.readAsDataURL(e.target.files[0]);
      setShowCropper(true);
    }
  }

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ]

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {preferences.theme === 'light' && <DaySkyAnimation />}
      {preferences.theme === 'dark' && <StarfieldBackground />}
      
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account information and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-primary btn-md inline-flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Information</h2>
          </div>
          <div className="p-4 sm:p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
<<<<<<< HEAD
=======
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                    {croppedAvatar ? (
                      <img className="h-24 w-24 rounded-full object-cover" src={croppedAvatar} alt={user.name} />
                    ) : user?.avatar ? (
                      <img className="h-24 w-24 rounded-full object-cover" src={user.avatar} alt={user.name} />
                    ) : (
                      <span className="text-3xl font-bold text-primary-600 dark:text-primary-200">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <button type="button" className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary-600 dark:bg-primary-800 text-white rounded-full flex items-center justify-center hover:bg-primary-700 dark:hover:bg-primary-900 transition-colors" onClick={() => document.getElementById('avatarUpload')?.click()}>
                        <Camera className="h-4 w-4" />
                      </button>
                      <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
                    </>
                  )}
                  {showCropper && avatarSrc && (
                    <ProfileAvatarCropper image={avatarSrc} onCrop={(base64) => { setCroppedAvatar(base64); setShowCropper(false); }} onClose={() => setShowCropper(false)} />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
>>>>>>> d12336ba2fc10c2fa1379a40f604f9d4c1d7ffad
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    <Globe className="h-4 w-4 inline mr-2" />
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="input w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn btn-primary btn-md inline-flex items-center"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preferences</h2>
          </div>
          <div className="p-4 sm:p-6">
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  <Palette className="h-4 w-4 inline mr-2" />
                  Theme
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('theme', 'light')}
                    className={`flex-1 py-4 px-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                      preferences.theme === 'light'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <Sun className={`h-6 w-6 mx-auto mb-2 ${preferences.theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <div className="font-medium">Light</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange('theme', 'dark')}
                    className={`flex-1 py-4 px-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                      preferences.theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <Moon className={`h-6 w-6 mx-auto mb-2 ${preferences.theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
                      <div className="font-medium">Dark</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  <Bell className="h-4 w-4 inline mr-2" />
                  Budget Alerts
                </label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Budget Alerts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when approaching budget limits</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.budgetAlerts}
                      onChange={(e) => handlePreferenceChange('budgetAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-800 after:border-gray-300 dark:after:border-gray-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={updatePreferencesMutation.isPending}
                  className="btn btn-primary btn-md inline-flex items-center"
                >
                  {updatePreferencesMutation.isPending ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
