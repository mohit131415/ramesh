"use client"

import { createContext, useState, useContext, useCallback } from "react"
import { userService } from "../services/userService"

const UserContext = createContext()

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({})
  const [statistics, setStatistics] = useState({})

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)

      const response = await userService.getUsers(params)

      if (response.status === "success") {
        setUsers(response.data)
        setMeta(response.meta)
        setStatistics(response.meta.statistics)
      } else {
        setError(response.message || "Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserById = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)

      const response = await userService.getUserById(id)

      if (response.status === "success") {
        setCurrentUser(response.data)
        return response.data
      } else {
        setError(response.message || "Failed to fetch user")
        return null
      }
    } catch (err) {
      console.error("Error fetching user:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch user")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserStatus = useCallback(
    async (userId, status) => {
      try {
        setError(null)

        const response = await userService.updateUserStatus(userId, status)

        if (response.status === "success") {
          // Update the user in the current list if it exists
          setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, status: status } : user)))

          // Update current user if it's the same user
          if (currentUser && currentUser.id === userId) {
            setCurrentUser((prev) => ({ ...prev, status: status }))
          }

          return true
        } else {
          setError(response.message || "Failed to update user status")
          return false
        }
      } catch (err) {
        console.error("Error updating user status:", err)
        setError(err.response?.data?.message || err.message || "Failed to update user status")
        return false
      }
    },
    [currentUser],
  )

  const fetchUserStatistics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await userService.getUserStatistics()

      if (response.status === "success") {
        setStatistics(response.data)
        return response.data
      } else {
        setError(response.message || "Failed to fetch statistics")
        return null
      }
    } catch (err) {
      console.error("Error fetching statistics:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch statistics")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const exportUsers = useCallback(async (params = {}) => {
    try {
      setError(null)

      const response = await userService.exportUsers(params)

      if (params.format === "csv") {
        // For CSV, the response should be a blob
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        // For JSON, handle as regular response
        if (response.status === "success") {
          const dataStr = JSON.stringify(response.data, null, 2)
          const dataBlob = new Blob([dataStr], { type: "application/json" })
          const url = window.URL.createObjectURL(dataBlob)
          const link = document.createElement("a")
          link.href = url
          link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.json`)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        } else {
          setError(response.message || "Failed to export users")
        }
      }

      return true
    } catch (err) {
      console.error("Error exporting users:", err)
      setError(err.response?.data?.message || err.message || "Failed to export users")
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        loading,
        error,
        meta,
        statistics,
        fetchUsers,
        fetchUserById,
        updateUserStatus,
        fetchUserStatistics,
        exportUsers,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
