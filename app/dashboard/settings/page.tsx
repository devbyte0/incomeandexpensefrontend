'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Trash2,
  Key,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import DaySkyAnimation from '@/components/DaySkyAnimation'
import StarfieldBackground from '@/components/StarfieldBackground'
import { authAPI, usersAPI } from '@/lib/api'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorPassword, setTwoFactorPassword] = useState('')
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password updated successfully!')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      // Error is handled by interceptor
    }
  }

  const handleDataExport = () => {
    // In a real app, this would generate and download user data
    toast.success('Data export started! You will receive an email when ready.')
  }

  const handleClearCache = () => {
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
    toast.success('Cache cleared successfully!')
  }

  const handleAccountDeletion = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password')
      return
    }
    try {
      await usersAPI.deleteAccount({ password: deletePassword })
      toast.success('Account deleted. Goodbye!')
      setShowDeleteModal(false)
      setDeletePassword('')
      window.location.href = '/auth/login'
    } catch (err) {
      // handled by interceptor
    }
  }

  const openSessions = async () => {
    setShowSessionsModal(true)
    setSessionsLoading(true)
    try {
      const { data } = await authAPI.getSessions()
      setSessions(data?.data?.sessions || [])
    } catch (err) {
    } finally {
      setSessionsLoading(false)
    }
  }

  const revokeCurrentSession = async () => {
    try {
      await authAPI.revokeCurrentSession()
      toast.success('Signed out from this device')
      window.location.href = '/auth/login'
    } catch {}
  }

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setTwoFactorLoading(true)
    try {
      await authAPI.enable2FA()
      toast.success('Two-factor authentication enabled successfully!')
      setShow2FAModal(false)
      setTwoFactorPassword('')
      // Reload user data to reflect 2FA status
      window.location.reload()
    } catch (err) {
      // Error is handled by interceptor
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!twoFactorPassword) {
      toast.error('Please enter your password')
      return
    }
    setTwoFactorLoading(true)
    try {
      await authAPI.disable2FA({ password: twoFactorPassword })
      toast.success('Two-factor authentication disabled successfully!')
      setShow2FAModal(false)
      setTwoFactorPassword('')
      // Reload user data to reflect 2FA status
      window.location.reload()
    } catch (err) {
      // Error is handled by interceptor
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !(showPasswords as any)[field]
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative">
      {/* Background Animations */}
      {user?.preferences?.theme === 'light' && <DaySkyAnimation />}
      {user?.preferences?.theme === 'dark' && <StarfieldBackground />}
      
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Password</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn btn-secondary btn-sm"
              >
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.isTwoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                </p>
              </div>
              <button 
                onClick={() => setShow2FAModal(true)}
                className="btn btn-secondary btn-sm"
              >
                {user?.isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Login Sessions</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage active sessions</p>
              </div>
              <button onClick={openSessions} className="btn btn-secondary btn-sm">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-800 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-800 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Budget Alerts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when approaching limits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-800 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Management</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Export Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download all your data in JSON format</p>
              </div>
              <button
                onClick={handleDataExport}
                className="btn btn-secondary btn-sm inline-flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Clear Cache</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clear local application cache</p>
              </div>
              <button 
                onClick={handleClearCache}
                className="btn btn-secondary btn-sm"
              >
                Clear Cache
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Reset Preferences</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reset all settings to default</p>
              </div>
              <button className="btn btn-secondary btn-sm">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Actions</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sign Out</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of all devices</p>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                Sign Out
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete Account</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger btn-sm inline-flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">App Information</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Version</p>
                <p className="font-medium dark:text-gray-100">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Build</p>
                <p className="font-medium dark:text-gray-100">2025.10.27</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-medium dark:text-gray-100">October 2025</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">User ID</p>
                <p className="font-medium font-mono text-xs dark:text-gray-100">{user?._id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full dark:bg-gray-800">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="input w-full pr-10 dark:bg-gray-700 dark:text-gray-100"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="input w-full pr-10 dark:bg-gray-700 dark:text-gray-100"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input w-full pr-10 dark:bg-gray-700 dark:text-gray-100"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-md flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-gray-100"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="btn btn-secondary btn-md dark:bg-gray-700 dark:text-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-danger-600 dark:text-danger-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Account</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This will permanently remove your account, transactions, and categories. Please confirm by entering your password.
                </p>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="input w-full mb-6 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter your password"
                />

                <div className="flex space-x-3">
                  <button
                    onClick={handleAccountDeletion}
                    className="btn btn-danger btn-md flex-1 dark:bg-red-600 dark:hover:bg-red-700 dark:text-gray-100"
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn btn-secondary btn-md dark:bg-gray-700 dark:text-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSessionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full dark:bg-gray-800">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Sessions</h3>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center h-24"><div className="loading-spinner" /></div>
                ) : (
                  <div className="space-y-3">
                    {sessions.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active sessions.</p>
                    )}
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{s.current ? 'This device' : 'Device'}</p>
                          <p className="text-gray-600 dark:text-gray-400 break-all">{s.device}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">IP: {s.ip}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Last active: {new Date(s.lastActive).toLocaleString()}</p>
                        </div>
                        {s.current && (
                          <button onClick={revokeCurrentSession} className="btn btn-secondary btn-sm">Sign out</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowSessionsModal(false)} className="btn btn-secondary btn-sm">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {user?.isTwoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user?.isTwoFactorEnabled 
                    ? 'Enter your password to disable two-factor authentication.' 
                    : 'Two-factor authentication will be enabled. You will receive a verification code via email on each login.'}
                </p>

                <form onSubmit={user?.isTwoFactorEnabled ? handleDisable2FA : handleEnable2FA} className="space-y-4">
                  {user?.isTwoFactorEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={twoFactorPassword}
                        onChange={(e) => setTwoFactorPassword(e.target.value)}
                        className="input w-full dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShow2FAModal(false)
                        setTwoFactorPassword('')
                      }}
                      className="btn btn-secondary btn-md flex-1 dark:bg-gray-700 dark:text-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={twoFactorLoading}
                      className="btn btn-primary btn-md flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {twoFactorLoading ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        user?.isTwoFactorEnabled ? 'Disable' : 'Enable'
                      )}
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
