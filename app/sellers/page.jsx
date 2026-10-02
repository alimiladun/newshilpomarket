"use client"
import { useState, useEffect } from "react"
import SellersHeader from "../../components/SellersHeader"
import Link from "next/link"
import DirectContactButtons from "../../components/DirectContactButtons"
import AssistedTradeModal from "../../components/AssistedTradeModal"
import { useLanguage } from "../../contexts/LanguageContext"
import { ShieldCheck, Building2, CheckCircle2, Phone } from "lucide-react"

const API_BASE_URL = ''; // relative path

export default function SellersPage() {
  const { isBn, toBanglaNumber } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAssistedModalOpen, setIsAssistedModalOpen] = useState(false)
  const [selectedSupplierForInspection, setSelectedSupplierForInspection] = useState('')

  const countries = [
    { id: "all", name: "All Countries", count: 0 },
    { id: "usa", name: "United States", count: 0 },
    { id: "germany", name: "Germany", count: 0 },
    { id: "china", name: "China", count: 0 },
    { id: "india", name: "India", count: 0 },
    { id: "uk", name: "United Kingdom", count: 0 },
    { id: "japan", name: "Japan", count: 0 },
    { id: "bangladesh", name: "Bangladesh", count: 0 },
  ]

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "1", name: "Textiles & Apparel" },
    { id: "2", name: "Electronics" },
    { id: "3", name: "Food & Beverages" },
    { id: "4", name: "Construction Materials" },
    { id: "5", name: "Chemicals" },
    { id: "6", name: "Automotive" },
    { id: "7", name: "Handicrafts" },
  ]

  useEffect(() => {
    fetchSuppliers();
  }, [selectedCategory, sortBy, selectedCountry]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      let url = `/api/suppliers?`;
      
      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`;
      }
      if (selectedCountry !== 'all') {
        url += `country=${selectedCountry}&`;
      }
      url += `sort=${sortBy}`;

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      } else {
        console.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SellersHeader />
      
      {/* Main Content with Top Margin */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter Button for Mobile */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                {showFilters ? (
                  <>
                    <span>Hide Filters</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Show Filters</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Filters Sidebar */}
            <div
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block lg:w-1/5`}
            >
              <div className="bg-white rounded-lg shadow p-4 sticky top-20">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Filters</h3>

                {/* Countries */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Countries</h4>
                  <div className="space-y-1">
                    {countries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => setSelectedCountry(country.id)}
                        className={`w-full text-left py-1 px-2 rounded text-xs transition ${
                          selectedCountry === country.id
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Categories</h4>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left py-1 px-2 rounded text-xs transition ${
                          selectedCategory === category.id
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Assisted Trade Verification Hero Banner */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 mb-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 text-xl font-bold">
                    🛡️
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 mb-1">
                      <span>✓ {isBn ? "শিল্পমার্কেট নিশ্চিত ট্রেড" : "ShilpoMarket Assisted Trade"}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {isBn ? "বড় চালানে সরেজমিনে ফ্যাক্টরি ভিজিট ও কোয়ালিটি টেস্ট চান?" : "Need on-site factory verification for bulk orders?"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isBn
                        ? "আমাদের ট্রেড এজেন্ট আপনার হয়ে সাপ্লায়ারের মিলে গিয়ে মাল ও ওজন সরেজমিনে পরিদর্শন করবে।"
                        : "Our trade agent physically inspects stock, volume, and quality before you complete payment."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupplierForInspection('');
                    setIsAssistedModalOpen(true);
                  }}
                  className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? "প্রতিনিধি বুক করুন" : "Book Trade Agent"}</span>
                </button>
              </div>

              {/* Header */}
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {loading ? 'Loading...' : `${suppliers.length} Suppliers Found`}
                  </h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Empty State */}
              {!loading && suppliers.length === 0 && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
                </div>
              )}

              {/* Suppliers Grid */}
              {!loading && suppliers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={supplier.profileImage?.url || "/placeholder.svg?height=80&width=80"}
                          alt={supplier.companyName}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">{supplier.companyName || `${supplier.firstName} ${supplier.lastName}`}</h3>
                              <p className="text-xs text-gray-600 mt-0.5">{supplier.address || 'Location not specified'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {(supplier.isVerified || supplier.isApproved) && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                  ✓ {isBn ? "লাইসেন্স যাচাইকৃত" : "Verified"}
                                </span>
                              )}
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                🏭 {isBn ? "মিল পরিদর্শিত" : "Inspected"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-3 text-xs text-gray-600">
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span className="font-medium">{supplier.rating?.toFixed(1) || '4.5'}</span>
                              <span className="ml-1">({supplier.reviews || 0})</span>
                            </div>
                            <span>•</span>
                            <span>{supplier.productsCount || 0} {isBn ? "টি কাঁচামাল" : "Products"}</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-gray-600 line-clamp-2">
                        {supplier.industry || 'Industry not specified'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {isBn ? "রেসপন্স: " : "Response: "}{supplier.responseTime || '< 2 hours'}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {isBn ? "অর্ডার: " : "Orders: "}{supplier.totalOrders || '1000+'}
                          </span>
                        </div>
                      </div>
                      {/* 1-Tap Call and WhatsApp */}
                      <DirectContactButtons
                        phone={supplier.phone}
                        supplierName={supplier.companyName || `${supplier.firstName} ${supplier.lastName}`}
                        variant="card"
                      />

                      {/* On-Site Mill Inspection Booking */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSupplierForInspection(supplier.companyName || `${supplier.firstName} ${supplier.lastName}`);
                          setIsAssistedModalOpen(true);
                        }}
                        className="w-full mt-2 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{isBn ? "এই মিল পরিদর্শনের এজেন্ট বুক করুন" : "Book Mill Inspection Agent"}</span>
                      </button>

                      <Link href={`/sellers/${supplier._id}`} className="block mt-2">
                        <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-1.5 rounded-lg text-xs font-semibold transition border border-slate-200">
                          {isBn ? "প্রোফাইল ও সকল পণ্য দেখুন (View Profile)" : "View Profile & Products"}
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assisted Trade Verification Modal */}
      <AssistedTradeModal
        isOpen={isAssistedModalOpen}
        onClose={() => setIsAssistedModalOpen(false)}
        initialMaterial={selectedSupplierForInspection}
      />
    </div>
  )
}
