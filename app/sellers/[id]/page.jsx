"use client"
import { useState, useEffect, use } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import SellersHeader from "../../../components/SellersHeader"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export default function SellerDetailPage({ params }) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const supplierId = unwrappedParams?.id || routeParams?.id;
  
  const [activeTab, setActiveTab] = useState("products")
  const [supplier, setSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      console.log('Fetching supplier with ID:', supplierId);
      console.log('API URL:', `${API_BASE_URL}/api/suppliers/${supplierId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Supplier data:', data);
        setSupplier(data.supplier);
        setProducts(data.supplier.products || []);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to fetch supplier:', response.status, errorData);
        setSupplier(null);
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
      setSupplier(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SellersHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!supplier) {
    return (
      <>
        <SellersHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplier Not Found</h1>
            <Link href="/sellers" className="text-blue-600 hover:underline">
              Back to Sellers
            </Link>
          </div>
        </div>
      </>
    );
  }

  const stats = supplier.stats || {};
  const reviews = []; // Mock reviews for now

  return (
    <div className="min-h-screen bg-gray-50">
      <SellersHeader />
      
      <div className="pt-20">
        {/* Banner with Profile */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-48 relative">
          <div className="container mx-auto px-4">
            <div className="absolute -bottom-16 left-4 md:left-8">
              <div className="flex items-end space-x-6">
                <img
                  src={supplier.profileImage?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=120&fit=crop"}
                  alt={supplier.companyName}
                  className="w-32 h-32 rounded-lg border-4 border-white shadow-lg object-cover"
                />
                <div className="pb-4">
                  <h1 className="text-white text-3xl font-bold">{supplier.companyName || `${supplier.firstName} ${supplier.lastName}`}</h1>
                  <p className="text-blue-100 mt-1">{supplier.address || 'Location not specified'}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    {stats.verified && (
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                    <div className="flex items-center text-white">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="font-semibold">{stats.rating?.toFixed(1) || '4.5'}</span>
                      <span className="ml-1 text-blue-100">({stats.reviews || 0} reviews)</span>
                    </div>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Stats */}
        <div className="bg-white border-b mt-20">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Products Listed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || '1000+'}</p>
                <p className="text-sm text-gray-600 mt-1">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.established || new Date().getFullYear()}</p>
                <p className="text-sm text-gray-600 mt-1">Established</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.responseTime || '< 2 hours'}</p>
                <p className="text-sm text-gray-600 mt-1">Response Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                        activeTab === "products"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Products ({products.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("about")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                        activeTab === "about"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      About Company
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                        activeTab === "reviews"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Reviews ({stats.reviews || 0})
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Products Tab */}
                  {activeTab === "products" && (
                    <div>
                      {products.length === 0 ? (
                        <div className="text-center py-12">
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
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                          <p className="mt-1 text-sm text-gray-500">This supplier hasn't listed any products yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {products.map((product) => (
                            <Link key={product._id} href={`/products/${product._id}`}>
                              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
                                <img
                                  src={product.primaryImage || product.images?.[0]?.url || "https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=200&h=200&fit=crop"}
                                  alt={product.name}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-blue-600 font-bold text-lg">৳{product.price?.toLocaleString() || 0}</span>
                                    {product.rating && (
                                      <span className="text-sm text-gray-600 flex items-center">
                                        <span className="text-yellow-400 mr-1">★</span>
                                        {product.rating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">MOQ: {product.minOrder} {product.unit}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* About Tab */}
                  {activeTab === "about" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Overview</h3>
                        <p className="text-gray-600">
                          {supplier.industry ? `Specializing in ${supplier.industry}.` : 'No description available.'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Company Type</p>
                            <p className="font-medium">{supplier.companyType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Employees</p>
                            <p className="font-medium">{stats.employees || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trade License</p>
                            <p className="font-medium">{supplier.tradeLicense || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Website</p>
                            <p className="font-medium">
                              {supplier.website ? (
                                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  Visit Website
                                </a>
                              ) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === "reviews" && (
                    <div>
                      {reviews.length === 0 ? (
                        <div className="text-center py-12">
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
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                          <p className="mt-1 text-sm text-gray-500">Be the first to review this supplier</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center">
                                    <span className="font-semibold text-gray-900">{review.reviewer}</span>
                                    {review.verified && (
                                      <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                        ✓ Verified Purchase
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                      >
                                        ★
                                      </span>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{supplier.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{supplier.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{supplier.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Contact Supplier
                </button>
                <button className="w-full mt-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
