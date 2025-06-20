"use client"

import { Outlet } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import CollapsibleSidebar from "./CollapsibleSidebar"
import Header from "./Header"

const MainLayout = () => {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <CollapsibleSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
