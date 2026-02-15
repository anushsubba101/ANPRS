import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

interface User {
  id: number
  username: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  
  login: (username: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (username, password) => {
        set({ loading: true, error: null })
        try {
          const response = await authApi.login(username, password)
          const { access_token } = response
          
          // Store token
          localStorage.setItem('token', access_token)
          
          // Get user info
          const userResponse = await authApi.getCurrentUser()
          
          set({
            user: userResponse,
            token: access_token,
            isAuthenticated: true,
            loading: false
          })
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(userResponse))
          
        } catch (error: any) {
          console.error('Login error:', error)
          set({
            error: error.response?.data?.detail || error.message || 'Login failed',
            loading: false
          })
          throw error
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          await authApi.register(userData)
          set({ loading: false })
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || error.message || 'Registration failed',
            loading: false
          })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      // src/store/useAuthStore.js
checkAuth: async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    get().logout();
    return;
  }
  
  set({ loading: true });
  
  try {
    // Actually verify the token with the server
    const userResponse = await authApi.getCurrentUser();
    
    set({
      user: userResponse,
      token: token,
      isAuthenticated: true,
      loading: false
    });
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(userResponse));
    
  } catch (error: any) {
    console.error('Auth check failed:', error);
    
    // Token is invalid or expired
    if (error.response?.status === 401) {
      console.log('Token expired, clearing auth...');
      get().logout();
    }
    
    set({
      error: error.response?.data?.detail || 'Session expired',
      loading: false
    });
  }
},

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)