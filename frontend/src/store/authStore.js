import { create } from 'zustand'
import * as authService from '@/services/authService'
import { updateFarm as updateFarmService } from '@/services/profileService'

export const useAuthStore = create((set, get) => ({
  user: null,
  farm: null,
  token: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated

  async hydrate() {
    set({ status: 'loading' })
    const { data } = await authService.getSession()
    if (data) {
      set({ user: data.user, farm: data.farm, token: data.token, status: 'authenticated' })
    } else {
      set({ user: null, farm: null, token: null, status: 'unauthenticated' })
    }
  },

  async login(credentials) {
    const { data, error } = await authService.login(credentials)
    if (error) return { error }
    set({ user: data.user, farm: data.farm, token: data.token, status: 'authenticated' })
    return { error: null }
  },

  async register(payload) {
    const { data, error } = await authService.registerFarm(payload)
    if (error) return { error }
    return { error: null, farm: data.farm }
  },

  async logout() {
    await authService.logout()
    set({ user: null, farm: null, token: null, status: 'unauthenticated' })
  },

  async updateProfile(patch) {
    const { data, error } = await authService.updateProfile(patch)
    if (error) return { error }
    set({ user: data })
    return { data, error: null }
  },

  async updateFarm(patch) {
    const { data, error } = await updateFarmService(get().farm?.id, patch)
    if (error) return { error }
    set({ farm: data })
    return { data, error: null }
  },

  isAuthenticated: () => get().status === 'authenticated',
}))