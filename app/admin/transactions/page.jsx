"use client"
import { useState, useEffect } from "react"
import AdminLayout from "../../../components/AdminLayout"

export default function AdminTransactions() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    pendingAmount: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      console.log('Fetching all transactions for admin...')
      const response = await fetch('/api/transactions?userType=admin')
      const data = await response.json()

      console.log('Admin transactions response:', data)

      if (data.success) {
        setTransactions(data.transactions || [])
        setStats({
          totalRevenue: data.stats.totalIncome || 0,
          totalCommission: data.stats.totalCommission || 0,
          pendingAmount: data.stats.pendingAmount || 0,
          totalTransactions: data.stats.totalTransactions || 0
        })
      } else {
        console.error('Failed to fetch transactions:', data.message)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (transactionId, newStatus) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the transaction in the local state
        setTransactions(transactions.map(t => 
          t._id === transactionId ? { ...t, status: newStatus } : t
        ))
        // Refresh stats
        fetchTransactions()
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesSearch =
      transaction.buyer?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.seller?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.seller?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.metadata?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Transaction Management</h2>
            <p className="text-gray-600 mt-2">Monitor and manage all platform transactions</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Export Report
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Generate Invoice
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">৳{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">৳{stats.totalCommission.toLocaleString()}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">৳{stats.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTransactions}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="commission">Commission</option>
                <option value="payout">Payout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Buyer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Supplier</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{transaction.transactionId}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      {transaction.order && (
                        <div className="text-xs text-blue-600 mt-1">
                          Order: {transaction.order.orderNumber || transaction.metadata?.orderNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {transaction.buyer?.companyName || transaction.buyer?.firstName || 'N/A'}
                      </div>
                      {transaction.buyer?.email && (
                        <div className="text-xs text-gray-500">{transaction.buyer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {transaction.seller?.companyName || transaction.seller?.firstName || 'N/A'}
                      </div>
                      {transaction.seller?.email && (
                        <div className="text-xs text-gray-500">{transaction.seller.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {transaction.metadata?.productName || transaction.description}
                      </div>
                      {transaction.metadata?.quantity && (
                        <div className="text-xs text-gray-500 mt-1">
                          Quantity: {transaction.metadata.quantity} units
                        </div>
                      )}
                      {transaction.metadata?.unitPrice && (
                        <div className="text-xs text-gray-500">
                          Unit Price: ৳{transaction.metadata.unitPrice.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">৳{transaction.amount.toLocaleString()}</div>
                      {transaction.metadata && (
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          {transaction.metadata.subtotal && (
                            <p>Subtotal: ৳{transaction.metadata.subtotal.toLocaleString()}</p>
                          )}
                          {transaction.metadata.shippingCost > 0 && (
                            <p>Shipping: ৳{transaction.metadata.shippingCost.toLocaleString()}</p>
                          )}
                          {transaction.metadata.tax > 0 && (
                            <p>Tax: ৳{transaction.metadata.tax.toLocaleString()}</p>
                          )}
                          {transaction.platformCommission > 0 && (
                            <p className="text-blue-600 font-medium">
                              Commission: ৳{transaction.platformCommission.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={transaction.status}
                        onChange={(e) => handleStatusChange(transaction._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {transaction.paymentMethod?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        {transaction.type === 'payment' && transaction.status === 'completed' && (
                          <button className="text-green-600 hover:text-green-800 text-sm">Invoice</button>
                        )}
                        {transaction.status === 'completed' && transaction.type === 'payment' && (
                          <button className="text-red-600 hover:text-red-800 text-sm">Refund</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
