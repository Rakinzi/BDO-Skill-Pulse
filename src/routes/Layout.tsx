import { Outlet } from 'react-router-dom'
import Sidebar from '../lib/components/Sidebar'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="ml-64 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
