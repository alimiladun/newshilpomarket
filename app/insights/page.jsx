"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import InsightsHeader from "../../components/InsightsHeader"

const PAGE_SIZE = 20

export default function InsightsPage() {
  const [insights, setInsights] = useState([])
  const [categoryCounts, setCategoryCounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [sortOrder, setSortOrder] = useState("-publishDate")
  const [trendingOnly, setTrendingOnly] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: "published",
        limit: String(PAGE_SIZE),
        page: String(page),
        sort: sortOrder,
      })
      if (selectedCategory !== "all") params.set("category", selectedCategory)
      if (selectedType !== "all") params.set("type", selectedType)
      if (trendingOnly) params.set("trending", "true")

      const res = await fetch(`/api/insights?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setInsights(data.insights)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setCategoryCounts(data.categoryCounts || [])
      }
    } catch {
      // fail silently â€” show empty state
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, selectedType, sortOrder, trendingOnly])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, selectedType, sortOrder, trendingOnly])

  const formatDate = (insight) => {
    const date = insight.publishDate || insight.createdAt
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const allCategories = [
    { id: "all", name: "All Categories", count: total },
    ...categoryCounts.map((c) => ({ id: c._id, name: c._id, count: c.count })),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <InsightsHeader />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <span>{isFiltersOpen ? "Hide Filters" : "Show Filters"}</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filters Sidebar */}
            <div className={`${isFiltersOpen ? "block" : "hidden"} lg:block lg:w-1/5 absolute lg:relative z-10 w-full`}>
              {isFiltersOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-0" onClick={() => setIsFiltersOpen(false)} />
              )}
              <div className="bg-white rounded-lg shadow p-4 sticky top-20 z-10 w-11/12 mx-auto lg:w-auto">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Filters</h3>

                {/* Categories */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Categories</h4>
                  <div className="space-y-1">
                    {allCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => { setSelectedCategory(category.id); setIsFiltersOpen(false) }}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                          selectedCategory === category.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-xs opacity-75">({category.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Content Type</h4>
                  <div className="space-y-1">
                    {[
                      { id: "all", name: "All Types" },
                      { id: "blog", name: "Blog Posts" },
                      { id: "news", name: "News" },
                      { id: "guide", name: "Guides" },
                      { id: "announcement", name: "Announcements" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                          selectedType === t.id
                            ? "bg-gray-700 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trendingOnly}
                      onChange={(e) => setTrendingOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-700">ðŸ”¥ Trending Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-4/5 flex-grow">
              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 bg-white rounded-lg p-2 shadow-sm">
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <span className="text-sm text-gray-600">
                    {loading ? "Loadingâ€¦" : `${total} article${total !== 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="-publishDate">Newest First</option>
                    <option value="publishDate">Oldest First</option>
                    <option value="-views">Most Viewed</option>
                    <option value="-createdAt">Recently Added</option>
                  </select>
                </div>
              </div>

              {/* Insights Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                      <div className="w-full h-32 bg-gray-200" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : insights.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center text-gray-400">
                  <span className="text-5xl block mb-3">ðŸ“°</span>
                  <p className="text-lg font-medium">No insights found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {insights.map((insight) => (
                    <Link
                      key={insight._id}
                      href={`/insights/${insight.slug}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="relative">
                        {insight.featuredImage?.url ? (
                          <img
                            src={insight.featuredImage.url}
                            alt={insight.title}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                            <span className="text-4xl">ðŸ“°</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {insight.category}
                          </span>
                        </div>
                        {insight.trending && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">ðŸ”¥</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{insight.title}</h3>
                        {insight.excerpt && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{insight.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate">{insight.author}</span>
                          <span>{insight.readTime}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formatDate(insight)}</span>
                          {insight.views > 0 && (
                            <span className="text-xs text-gray-400">{insight.views.toLocaleString()} views</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 7) {
                        pageNum = i + 1
                      } else if (page <= 4) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = page - 3 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            page === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
