"use client"

import { useToastStore } from "../../store/toastStore"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

// Export the toast function directly for easier imports
export const toast = (props) => {
  return useToastStore.getState().toast(props)
}

// Export the useToast hook from our store
export const useToast = () => {
  const { toast } = useToastStore()
  return { toast }
}

// Add the Toaster component export
export function Toaster() {
  const { toasts, dismissToast } = useToastStore()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-white rounded-lg border shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right",
            toast.variant === "destructive" && "border-red-600 text-red-600",
          )}
        >
          <div className="flex-1">
            {toast.title && <h3 className="font-medium">{toast.title}</h3>}
            {toast.description && <p className="text-sm text-muted-foreground">{toast.description}</p>}
          </div>
          <button onClick={() => dismissToast(toast.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
