"use client"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import AdminLayout from "../../../components/AdminLayout"
import Link from "next/link"

export default function AdminInsights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/insights?adminView=true&status=all&limit=200")
      const data = await res.json()
      if (data.success) setInsights(data.insights)
    } catch {
      showToast("Failed to load insights", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const handleStatusChange = async (insightId, newStatus) => {
    const token = getToken()
    setInsights((prev) =>
      prev.map((i) => (i._id === insightId ? { ...i, status: newStatus } : i))
    )
    try {
      const res = await fetch(`/api/insights/${insightId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      showToast("Status updated")
    } catch (err) {
      showToast(err.message || "Failed to update status", "error")
      fetchInsights()
    }
  }

  const handleToggle = async (insightId, field, currentValue) => {
    const token = getToken()
    setInsights((prev) =>
      prev.map((i) => (i._id === insightId ? { ...i, [field]: !currentValue } : i))
    )
    try {
      const res = await fetch(`/api/insights/${insightId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: !currentValue }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`)
    } catch (err) {
      showToast(err.message || "Failed to update", "error")
      fetchInsights()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const token = getToken()
    try {
      const res = await fetch(`/api/insights/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setInsights((prev) => prev.filter((i) => i._id !== deleteTarget._id))
      showToast("Insight deleted successfully")
    } catch (err) {
      showToast(err.message || "Failed to delete", "error")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filtered = insights.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesStatus && matchesSearch
  })

  const totalViews = insights.reduce((sum, c) => sum + (c.views || 0), 0)

  const typeBadgeClass = (type) => {
    if (type === "news") return "bg-red-100 text-red-800"
    if (type === "blog") return "bg-blue-100 text-blue-800"
    if (type === "guide") return "bg-green-100 text-green-800"
    return "bg-purple-100 text-purple-800"
  }

  const statusSelectClass = (status) => {
    if (status === "published") return "bg-green-100 text-green-800"
    if (status === "draft") return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  const formatDate = (date) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
              toast.type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Insight</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">&ldquo;{deleteTarget.title}&rdquo;</span>? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Insights Management</h2>
            <p className="text-gray-600 mt-1">Manage blog posts, news articles, and educational content</p>
          </div>
          <Link
            href="/admin/insights/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Create Insight
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Articles", value: insights.length, color: "text-gray-800", icon: "📝" },
            { label: "Published", value: insights.filter((c) => c.status === "published").length, color: "text-green-600", icon: "✅" },
            { label: "Drafts", value: insights.filter((c) => c.status === "draft").length, color: "text-yellow-600", icon: "📄" },
            { label: "Total Views", value: totalViews.toLocaleString(), color: "text-blue-600", icon: "👁️" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="news">News</option>
                <option value="blog">Blog Posts</option>
                <option value="guide">Guides</option>
                <option value="announcement">Announcements</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or category…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading insights…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-4xl mb-2">📭</span>
              <p>No insights found</p>
              <Link href="/admin/insights/add" className="mt-3 text-blue-600 hover:underline text-sm">
                Create your first insight
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Author</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Published</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Featured</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Trending</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-medium text-gray-800 truncate">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                        {item.featuredImage?.url && (
                          <div className="mt-1 relative w-16 h-10">
                            <Image
                              src={item.featuredImage.url}
                              alt=""
                              fill
                              className="object-cover rounded"
                              unoptimized
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${typeBadgeClass(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusSelectClass(item.status)}`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.author}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(item.publishDate || item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {(item.views || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(item._id, "featured", item.featured)}
                          title={item.featured ? "Remove from featured" : "Mark as featured"}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            item.featured ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                          }`}
                        >
                          ⭐
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(item._id, "trending", item.trending)}
                          title={item.trending ? "Remove from trending" : "Mark as trending"}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            item.trending ? "text-orange-500" : "text-gray-300 hover:text-orange-400"
                          }`}
                        >
                          🔥
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/admin/insights/${item._id}/edit`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          {item.status === "published" && (
                            <Link
                              href={`/insights/${item.slug}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
