"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import ProductHeader from "../../components/ProductHeader"
import DirectContactButtons from "../../components/DirectContactButtons"
import AudioReaderButton from "../../components/AudioReaderButton"
import { useLanguage } from "../../contexts/LanguageContext"
import { getRootCategories } from "@/lib/categoriesData"

const API_BASE = ''; // relative paths — works on any port

function ProductsContent() {
  const { t, isBn, toBanglaNumber } = useLanguage();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';

  const categories = getRootCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const priceDebounceRef = useRef(null);

  // Debounce price range — only fire fetch 400 ms after user stops sliding
  useEffect(() => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 400);
    return () => clearTimeout(priceDebounceRef.current);
  }, [priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, debouncedPriceRange, inStockOnly, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/api/products?`;
      
      if (searchQuery.trim()) {
        url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      }

      if (selectedCategory !== 'all') {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      
      url += `minPrice=${debouncedPriceRange[0]}&maxPrice=${debouncedPriceRange[1]}`;
      
      if (inStockOnly) {
        url += `&inStock=true`;
      }

      // Sorting
      let sortParam = '-createdAt';
      if (sortBy === 'price-low') sortParam = 'price';
      if (sortBy === 'price-high') sortParam = '-price';
      if (sortBy === 'rating') sortParam = '-rating';
      if (sortBy === 'newest') sortParam = '-createdAt';
      
      url += `&sort=${sortParam}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Client-side exact match prioritization
  const filteredProducts = [...products].sort((a, b) => {
    if (!searchQuery.trim()) return 0;
    const term = searchQuery.trim().toLowerCase();
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();

    // Exact match comes first
    const aExact = aName === term;
    const bExact = bName === term;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Starts with term
    const aStarts = aName.startsWith(term);
    const bStarts = bName.startsWith(term);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Contains term
    const aHas = aName.includes(term);
    const bHas = bName.includes(term);
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;

    return 0;
  });

  const getProductImage = (product) => {
    return (
      product.primaryImage ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      "/placeholder.svg"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductHeader />

      <div className="pt-20">
        <div className="container mx-auto px-4 py-4">
          {/* Filter Button for Mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-md hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              <FilterIcon className="w-5 h-5" />
              <span>{showFilters ? (isBn ? "ফিল্টার লুকান" : "Hide Filters") : (isBn ? "ফিল্টার দেখুন" : "Show Filters")}</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filters Sidebar */}
            <div className={`lg:w-1/5 ${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="bg-white rounded-lg shadow p-4 sticky lg:top-20">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{isBn ? "ফিল্টার ও ক্যাটাগরি" : "Filters"}</h3>

                {/* Categories */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">{isBn ? "ক্যাটাগরি" : "Categories"}</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors font-medium ${
                        selectedCategory === "all"
                          ? "bg-blue-50 text-blue-800 font-bold border border-blue-200"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isBn ? "সকল ক্যাটাগরি (All)" : "All Categories"}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors font-medium ${
                          selectedCategory === category.name
                            ? "bg-blue-50 text-blue-800 font-bold border border-blue-200"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">{isBn ? "দর সীমা (৳/ইউনিট)" : "Price Range (৳/unit)"}</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => {
                        setPriceRange([priceRange[0], Number.parseInt(e.target.value)]);
                      }}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-600 font-medium">
                      <span>৳{isBn ? toBanglaNumber(priceRange[0]) : priceRange[0]}</span>
                      <span>৳{isBn ? toBanglaNumber(priceRange[1]) : priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                      />
                      <span className="text-xs text-gray-700 font-medium">{isBn ? "শুধু যাচাইকৃত বিক্রেতা" : "Verified Suppliers Only"}</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                      />
                      <span className="text-xs text-gray-700 font-medium">{isBn ? "স্টক আছে এমন পণ্য" : "In Stock"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:w-4/5 flex-grow">
              {/* Active Search Banner Indicator */}
              {searchQuery && (
                <div className="flex items-center justify-between gap-3 mb-3 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-blue-900 shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">🔍</span>
                    <span>{isBn ? "অনুসন্ধান ফলাফল:" : "Search results for:"}</span>
                    <span className="font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                      "{searchQuery}"
                    </span>
                  </div>
                  <Link
                    href="/products"
                    className="shrink-0 text-xs font-bold text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span>{isBn ? "ফিল্টার মুছুন" : "Clear"}</span>
                  </Link>
                </div>
              )}

              {/* Sort and View Options */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-3 bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                  <span className="text-sm font-semibold text-gray-700">
                    {loading
                      ? (isBn ? "পণ্য লোড হচ্ছে..." : "Loading products...")
                      : (isBn
                          ? `${toBanglaNumber(filteredProducts.length)} টি কাঁচামাল প্রদর্শিত হচ্ছে`
                          : `${filteredProducts.length} products found`)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-medium">{isBn ? "সাজান:" : "Sort:"}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold bg-white"
                  >
                    <option value="featured">{isBn ? "বাছাইকৃত কাঁচামাল" : "Featured"}</option>
                    <option value="price-low">{isBn ? "কম দর থেকে বেশি" : "Price: Low to High"}</option>
                    <option value="price-high">{isBn ? "বেশি দর থেকে কম" : "Price: High to Low"}</option>
                    <option value="rating">{isBn ? "সেরা রেটিং" : "Highest Rated"}</option>
                    <option value="newest">{isBn ? "নতুন পণ্য" : "Newest"}</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-lg mx-auto">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                    {isBn ? "কোনো কাঁচামাল পাওয়া যায়নি" : "No raw materials found"}
                  </h3>
                  <p className="text-xs text-gray-500 mb-5">
                    {searchQuery
                      ? (isBn ? `"${searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি। বানান যাচাই করুন অথবা অন্য কাঁচামালের নাম লিখুন।` : `No products match "${searchQuery}". Please check your spelling or search another material.`)
                      : (isBn ? "এই ফিল্টারের আওতায় বর্তমানে কোনো পণ্য নেই।" : "No products available under current filters.")}
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-900/15"
                  >
                    <span>{isBn ? "সকল কাঁচামাল দেখুন →" : "View All Products →"}</span>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Products Grid - Equal Height Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                    {filteredProducts.map((product, index) => (
                      <Link key={product._id} href={`/products/${product._id}`} className="group flex flex-col h-full">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col h-full justify-between">
                          {/* Image Box - Fixed uniform aspect ratio */}
                          <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden flex-shrink-0">
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading={index < 8 ? "eager" : "lazy"}
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
                            {product.supplier?.verified && (
                              <div className="absolute top-2 left-2 bg-blue-800 text-white text-[11px] px-2 py-0.5 rounded-full font-bold shadow-md">
                                ✓ {t("common.verified", "Verified")}
                              </div>
                            )}
                            {!product.inStock && (
                              <div className="absolute top-2 right-2 bg-red-600 text-white text-[11px] px-2 py-0.5 rounded-full font-bold shadow-md">
                                {t("common.outOfStock", "Out of Stock")}
                              </div>
                            )}
                          </div>

                          {/* Card Body - Equalized layout */}
                          <div className="p-3.5 flex flex-col flex-1 justify-between">
                            {/* Top Content */}
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 h-10 leading-snug mb-1">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 font-medium truncate mb-2">
                                🏭 {product.supplierName || "প্রস্তুতকারক"}
                              </p>

                              {/* Rating & Stock Badge Row */}
                              <div className="flex items-center justify-between h-6 mb-2">
                                <div className="flex items-center text-xs font-semibold text-gray-700">
                                  <span className="text-amber-400 mr-1">★</span>
                                  <span>
                                    {product.rating ? (isBn ? toBanglaNumber(product.rating.toFixed(1)) : product.rating.toFixed(1)) : (isBn ? "নতুন" : "New")}
                                  </span>
                                  <span className="text-gray-400 ml-1 font-normal text-[11px]">
                                    ({isBn ? toBanglaNumber(product.reviewCount || 0) : (product.reviewCount || 0)})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <AudioReaderButton
                                    productName={product.name}
                                    price={product.price}
                                    unit={product.unit}
                                    minOrder={product.minOrder}
                                    supplierName={product.supplierName}
                                    location={product.location}
                                    variant="icon"
                                    className="p-1 h-6 w-6 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                                  />
                                  {product.inStock && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-200">
                                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></span>
                                      {t("common.inStock", "In Stock")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Content - Pinned to bottom */}
                            <div className="mt-auto pt-2.5 border-t border-gray-100">
                              <div className="flex items-baseline justify-between mb-2">
                                <div className="text-sm sm:text-base font-black text-blue-700">
                                  <span>৳</span>{isBn ? toBanglaNumber(product.price?.toLocaleString()) : product.price?.toLocaleString()}
                                  <span className="text-xs font-medium text-gray-500 ml-0.5">/{product.unit || 'unit'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-bold text-gray-500">
                                    {isBn ? "কমপক্ষে: " : "Min: "}
                                    {isBn ? toBanglaNumber(product.minOrder) : product.minOrder} {product.unit}
                                  </span>
                                </div>
                              </div>

                              {/* Direct Contact Buttons */}
                              <DirectContactButtons
                                phone={product.supplier?.phone || product.phone}
                                productName={product.name}
                                price={product.price}
                                unit={product.unit}
                                supplierName={product.supplierName}
                                variant="card"
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <div className="flex space-x-1">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
                    3
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}

function FilterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}