"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import InsightsHeader from "../../../components/InsightsHeader"

export default function InsightDetailPage() {
  const { slug } = useParams()
  const [insight, setInsight] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/insights/slug/${slug}`)
        const data = await res.json()
        if (!data.success) { setNotFound(true); return }
        setInsight(data.insight)
        setRelated(data.related || [])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const formatDate = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const renderContent = (content) => {
    if (!content) return null
    return content.split(/\n\n+/).map((block, idx) => {
      const t = block.trim()
      if (!t) return null
      if (t.startsWith("### ")) return <h3 key={idx} className="text-xl font-semibold text-gray-800 mt-6 mb-2">{t.replace(/^### /, "")}</h3>
      if (t.startsWith("## ")) return <h2 key={idx} className="text-2xl font-bold text-gray-800 mt-8 mb-3">{t.replace(/^## /, "")}</h2>
      if (t.startsWith("# ")) return <h1 key={idx} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{t.replace(/^# /, "")}</h1>
      if (t.split("\n").every((l) => l.trim().startsWith("- "))) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 mb-4 text-gray-700">
            {t.split("\n").map((l, li) => <li key={li}>{l.replace(/^- /, "")}</li>)}
          </ul>
        )
      }
      const renderInline = (text) =>
        text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, pi) => {
          if (part.startsWith("**") && part.endsWith("**")) return <strong key={pi}>{part.slice(2, -2)}</strong>
          if (part.startsWith("*") && part.endsWith("*")) return <em key={pi}>{part.slice(1, -1)}</em>
          return part
        })
      return <p key={idx} className="text-gray-700 leading-relaxed mb-4">{renderInline(t.replace(/\n/g, " "))}</p>
    })
  }

  const typeBadgeClass = (type) => {
    if (type === "news") return "bg-red-100 text-red-700"
    if (type === "blog") return "bg-blue-100 text-blue-700"
    if (type === "guide") return "bg-green-100 text-green-700"
    return "bg-purple-100 text-purple-700"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InsightsHeader />
        <div className="pt-24 container mx-auto px-4">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="w-full h-72 bg-gray-200 rounded-xl mb-8" />
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded w-full mb-3" />)}
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !insight) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InsightsHeader />
        <div className="pt-24 container mx-auto px-4 text-center">
          <span className="text-6xl block mb-4">🔍</span>
          <h2 className="text-2xl font-bold text-gray-800">Insight Not Found</h2>
          <p className="text-gray-500 mt-2">This article may have been removed or the URL is incorrect.</p>
          <Link href="/insights" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            ← Back to Insights
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InsightsHeader />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/insights" className="hover:text-blue-600">Insights</Link>
              <span>/</span>
              <span className="text-gray-700 truncate max-w-xs">{insight.title}</span>
            </nav>

            {/* Article */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {insight.featuredImage?.url ? (
                <div className="relative">
                  <img src={insight.featuredImage.url} alt={insight.title} className="w-full h-72 md:h-96 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-6xl">📰</span>
                </div>
              )}

              <div className="p-6 md:p-10">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">{insight.category}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${typeBadgeClass(insight.type)}`}>{insight.type}</span>
                  {insight.trending && <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">🔥 Trending</span>}
                  {insight.featured && <span className="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">⭐ Featured</span>}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{insight.title}</h1>

                {insight.excerpt && (
                  <p className="text-lg text-gray-600 leading-relaxed mb-6 border-l-4 border-blue-500 pl-4">{insight.excerpt}</p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-1"><span>✍️</span><span className="font-medium text-gray-700">{insight.author}</span></div>
                  <div className="flex items-center gap-1"><span>📅</span><span>{formatDate(insight.publishDate || insight.createdAt)}</span></div>
                  <div className="flex items-center gap-1"><span>⏱️</span><span>{insight.readTime}</span></div>
                  <div className="flex items-center gap-1"><span>👁️</span><span>{(insight.views || 0).toLocaleString()} views</span></div>
                </div>

                {/* Body */}
                <article className="text-base leading-relaxed">
                  {renderContent(insight.content)}
                </article>

                {/* Tags */}
                {insight.tags?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link href="/insights" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    ← Back to Insights
                  </Link>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">Related Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {related.map((rel) => (
                    <Link key={rel._id} href={`/insights/${rel.slug}`} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md border border-transparent hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                      {rel.featuredImage?.url ? (
                        <img src={rel.featuredImage.url} alt={rel.title} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                          <span className="text-3xl">📰</span>
                        </div>
                      )}
                      <div className="p-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{rel.category}</span>
                        <h3 className="text-sm font-semibold text-gray-800 mt-2 line-clamp-2">{rel.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                          <span>{rel.author}</span>
                          <span>{rel.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
