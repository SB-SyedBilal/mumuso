import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

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
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    const payload = response.data

    if (!payload?.success || !payload?.data) {
      throw new Error('Unexpected login response from server')
    }

    const { access_token, refresh_token, user } = payload.data

    return {
      success: true,
      access_token,
      refresh_token,
      admin: {
        admin_id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
      },
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/logout`, {
      refresh_token: refreshToken,
    })
  },
}
