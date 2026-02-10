import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LogOut,
  Eye,
  Plus,
  FileText,
  BarChart3,
  User,
  Moon,
  Sun,
  Home,
  UserPlus,
  Bell,
  X
} from 'lucide-react'
import Button from './Button'

function Sidebar() {
  const { user, logout, logoutAll, isDarkMode, toggleDarkMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = user?.isAdmin ? [
    { path: '/admin', label: 'Dashboard', icon: Eye },
    { path: '/admin/participants', label: 'Participants', icon: User },
    { path: '/admin/results', label: 'View Results', icon: BarChart3 },
    { path: '/admin/create', label: 'Create Session', icon: Plus },
  ] : [
    { path: '/dashboard', label: 'Active Quiz', icon: FileText },
    { path: '/history', label: 'My History', icon: BarChart3 },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const response = await fetch(`http://localhost:3001/api/user/${user.email}/notifications`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        const unread = data.notifications.filter((n: any) => !n.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:3001/api/user/${user?.email}/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      // Update local state
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <img
            src="/bdo_logo.png"
            alt="BDO Logo"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-2" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleNavigation(item.path)
                  }
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-red-50 text-red-700 border-r-4 border-red-500'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label} ${isActive ? '(current page)' : ''}`}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} aria-hidden="true" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </div>

        {/* User Info Section */}
        {user && (
          <div className="px-4 py-4 border-t border-gray-200 bg-red-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-red-700">
                  {user.department} {user.isAdmin && '(Admin)'}
                </p>
              </div>
              {/* Notification Bell */}
              <button
                onClick={toggleNotifications}
                className="relative p-1 text-red-600 hover:text-red-800"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 border-red-300 text-red-600 hover:bg-red-100"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Logout Buttons */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-300 text-red-600 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logoutAll}
                  className="border-orange-300 text-orange-600 hover:bg-orange-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Panel */}
        {showNotifications && user && (
          <div className="absolute left-64 top-0 w-80 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Guest Actions */}
        {!user && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="w-full border-red-300 text-red-600 hover:bg-red-100"
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
