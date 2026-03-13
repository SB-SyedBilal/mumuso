'use client'

import { ReactNode, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Receipt,
  Store,
  LogOut,
  Menu,
  X,
  BarChart3,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Stores', href: '/dashboard/stores', icon: Store },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { admin, clearAuth, refreshToken } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
      clearAuth()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      clearAuth()
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-surface-dark text-white p-4 z-50 flex items-center justify-between">
        <h1 className="font-display text-xl">MUMUSO</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-dark transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h1 className="font-display text-2xl text-white mb-1">MUMUSO</h1>
            <p className="text-sm text-white/60">Admin Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent-gold text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-white/60">Logged in as</p>
              <p className="text-white font-medium truncate">{admin?.name}</p>
              <p className="text-xs text-white/40 truncate">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
