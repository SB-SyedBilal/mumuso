import { mockAuthApi } from './mockClient'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  access_token: string
  refresh_token: string
  admin: {
    admin_id: string
    name: string
    email: string
    role: string
    permissions: string[]
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const result = await mockAuthApi.login(credentials.email, credentials.password)
    return {
      success: true,
      ...result,
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    await mockAuthApi.logout(refreshToken)
  },
}
