import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), "")

  // Ensure VITE_API_BASE_URL is defined
  if (!env.VITE_API_BASE_URL) {
    throw new Error("❌ VITE_API_BASE_URL is not defined in your .env file")
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // host: true,   // 👈 This makes Vite listen on 0.0.0.0
      port: 5173, // 👈 Default port
      strictPort: true,
      proxy: {
        "/api": {
          // target: 'http://192.168.1.53/ramesh-be/be/api', // 👈 Use your PC's IP address, NOT 
          target: env.VITE_API_BASE_URL, // 👈 Use your PC's IP address, NOT 
          changeOrigin: true,
          secure: false,
        },
        "/imageapi": {
          target: env.VITE_IMAGE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/imageapi/, "/ramesh-be/be"),
        },
      },
    },
  }
})
