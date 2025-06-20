"use client"

import { createContext, useContext, useState } from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const ToastContext = createContext({
  toast: () => {},
})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, duration = 5000, variant = "default" }) => {
    const id = Math.random().toString(36).substring(2, 9)

    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant, duration }])

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, duration)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Add the Toaster component export
export function Toaster({ toasts, setToasts }) {
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
          <button
            onClick={() => setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast.id))}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

