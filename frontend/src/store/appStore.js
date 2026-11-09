import { create } from 'zustand'
import { storage } from '@/services/storage'

const preferences = storage.get('preferences', {}) || {}

export const useAppStore = create((set) => ({
  selectedBranchId: 'all', // 'all' = consolidated view
  setBranch: (id) => set({ selectedBranchId: id }),
  branchRevision: 0,
  refreshBranches: () => set((state) => ({ branchRevision: state.branchRevision + 1 })),

  dateRange: preferences.dashboardRange || '7d', // '7d' | '30d' | '90d' | 'ytd'
  setDateRange: (range) => {
    const current = storage.get('preferences', {}) || {}
    storage.set('preferences', { ...current, dashboardRange: range })
    set({ dateRange: range })
  },

  // Mobile drawer state
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  openSidebar: () => set({ sidebarOpen: true }),

  // Desktop / Tablet collapsible rail state
  sidebarCollapsed: preferences.sidebarCollapsed || false,
  toggleSidebarCollapsed: () =>
    set((s) => {
      const next = !s.sidebarCollapsed
      const current = storage.get('preferences', {}) || {}
      storage.set('preferences', { ...current, sidebarCollapsed: next })
      return { sidebarCollapsed: next }
    }),
  setSidebarCollapsed: (collapsed) => {
    const current = storage.get('preferences', {}) || {}
    storage.set('preferences', { ...current, sidebarCollapsed: collapsed })
    set({ sidebarCollapsed: collapsed })
  },
}))