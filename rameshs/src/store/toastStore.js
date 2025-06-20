import { create } from "zustand"

export const useToastStore = create((set) => ({
  toasts: [],

  showToast: ({ title, message, type = "info", duration = 5000 }) => {
    const id = Date.now()

    // Add new toast to the array
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type, duration }],
    }))

    // Set timeout to remove the toast after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    }, duration)
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// Attach to window for global access
if (typeof window !== "undefined") {
  window.showToast = ({ title, message, type, duration }) => {
    useToastStore.getState().showToast({ title, message, type, duration })
  }
}
