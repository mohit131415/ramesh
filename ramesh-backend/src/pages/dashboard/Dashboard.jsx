"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { ShoppingBag, Users, DollarSign, TrendingUp, Package, ArrowUpRight } from "lucide-react"

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
        {trend && (
          <p className={`mt-1 text-xs flex items-center ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend > 0 ? "+" : ""}
            {trend}% from last month
          </p>
        )}
      </div>
      <div className={`rounded-full p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to get dashboard stats
    setTimeout(() => {
      setStats({
        totalOrders: 1248,
        totalRevenue: 84250,
        totalProducts: 156,
        totalCustomers: 3890,
        recentOrders: [
          { id: 1001, customer: "John Doe", amount: 1250, status: "completed", date: "2023-04-16" },
          { id: 1002, customer: "Jane Smith", amount: 850, status: "processing", date: "2023-04-16" },
          { id: 1003, customer: "Robert Johnson", amount: 2100, status: "completed", date: "2023-04-15" },
          { id: 1004, customer: "Emily Davis", amount: 750, status: "pending", date: "2023-04-15" },
          { id: 1005, customer: "Michael Brown", amount: 1500, status: "completed", date: "2023-04-14" },
        ],
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || "Admin"}!</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={isLoading ? "..." : stats.totalOrders}
          icon={ShoppingBag}
          trend={12.5}
          color="bg-ramesh-gold"
        />
        <StatCard
          title="Total Revenue"
          value={isLoading ? "..." : `₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={8.2}
          color="bg-green-500"
        />
        <StatCard
          title="Total Products"
          value={isLoading ? "..." : stats.totalProducts}
          icon={Package}
          trend={4.6}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Customers"
          value={isLoading ? "..." : stats.totalCustomers}
          icon={Users}
          trend={6.8}
          color="bg-purple-500"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <button className="text-ramesh-gold hover:text-ramesh-gold/80 text-sm font-medium flex items-center">
              View All <ArrowUpRight className="ml-1 h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ramesh-gold"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-2 text-sm font-medium">#{order.id}</td>
                      <td className="py-3 px-2 text-sm">{order.customer}</td>
                      <td className="py-3 px-2 text-sm font-medium">₹{order.amount}</td>
                      <td className="py-3 px-2 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-500">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <button className="text-ramesh-gold hover:text-ramesh-gold/80 text-sm font-medium flex items-center">
              View Calendar <ArrowUpRight className="ml-1 h-3 w-3" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="mr-4 flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-ramesh-gold/10 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-ramesh-gold">APR</span>
                  <span className="text-sm font-bold text-ramesh-gold">18</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Quarterly Business Review</h3>
                <p className="text-xs text-gray-500">10:00 AM - 12:00 PM</p>
              </div>
            </div>

            <div className="flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="mr-4 flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-blue-500">MAY</span>
                  <span className="text-sm font-bold text-blue-500">02</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">New Product Launch</h3>
                <p className="text-xs text-gray-500">2:00 PM - 3:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
