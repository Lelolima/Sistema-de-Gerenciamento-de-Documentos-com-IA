import { Outlet, Link, useLocation } from 'react-router-dom'
import { FileText, Compare, BarChart3, Settings, LogOut, Menu, Sun, Moon, Upload } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'

export default function Layout() {
  const { user, signOut } = useAuthStore()
  const { darkMode, toggleDarkMode, sidebarOpen, toggleSidebar } = useAppStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FileText },
    { name: 'Documentos', href: '/documents', icon: Upload },
    { name: 'Comparar', href: '/compare', icon: Compare },
    { name: 'Análises', href: '/analysis', icon: BarChart3 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ]

  if (!user) {
    return <Outlet />
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border transition-all duration-300 overflow-hidden`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="w-8 h-8 text-primary-500" />
            <span className="font-bold text-xl">DocManager</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {darkMode ? 'Claro' : 'Escuro'}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}