import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Admin {
  admin_id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  admin: Admin | null
  isAuthenticated: boolean
  setAuth: (accessToken: string, refreshToken: string, admin: Admin) => void
  clearAuth: () => void
  updateAccessToken: (accessToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (accessToken, refreshToken, admin) =>
        set({
          accessToken,
          refreshToken,
          admin,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          admin: null,
          isAuthenticated: false,
        }),
      updateAccessToken: (accessToken) =>
        set({ accessToken }),
    }),
    {
      name: 'mumuso-admin-auth',
    }
  )
)
