'use client';
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import DirectContactButtons from "../DirectContactButtons";
import AudioReaderButton from "../AudioReaderButton";

const ITEMS_PER_PAGE = 4;
const AUTOPLAY_INTERVAL_MS = 5000;

// Strips any non-numeric leading characters (currency symbols) instead of
// blindly assuming the string starts with exactly one symbol char.
function formatAmount(value) {
  if (value == null) return "";
  return String(value).replace(/^[^\d]+/, "");
}

export default function FeaturedProducts({ featuredProducts = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalPages = Math.max(1, Math.ceil(featuredProducts.length / ITEMS_PER_PAGE));

  // Keep index in range if the product list shrinks/changes.
  useEffect(() => {
    if (currentIndex > totalPages - 1) setCurrentIndex(0);
  }, [totalPages, currentIndex]);

  useEffect(() => {
    if (isPaused || featuredProducts.length === 0 || totalPages <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [totalPages, isPaused, featuredProducts.length]);

  const goToPage = useCallback((index) => {
    setCurrentIndex(((index % totalPages) + totalPages) % totalPages);
  }, [totalPages]);

  const goPrev = () => goToPage(currentIndex - 1);
  const goNext = () => goToPage(currentIndex + 1);



  const currentProducts = featuredProducts.slice(
    currentIndex * ITEMS_PER_PAGE,
    (currentIndex + 1) * ITEMS_PER_PAGE
  );

  return (
    <section className="group h-full rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-slate-400 to-slate-600" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Featured Products</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 max-w-md">
                Discover premium raw materials from verified suppliers worldwide.
              </p>
            </div>
          </div>
          <div className="flex shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              View All Products
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-sm text-slate-500">
            No featured products right now — check back soon.
          </div>
        ) : (
          <div
            className="relative flex-1"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Prev / Next controls */}
            {totalPages > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous products"
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:bg-slate-50 hover:text-blue-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next products"
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:bg-slate-50 hover:text-blue-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Product grid, 2x2, fades between pages */}
            <div
              key={currentIndex}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeIn_0.35s_ease]"
            >
              {currentProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="block">
                    <div className="h-full bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-36 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {product.discount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                            {product.discount}
                          </div>
                        )}
                        {product.trending && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                            🔥 Trending
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-xs text-slate-600 font-medium truncate">{product.supplier}</p>
                          </div>
                          {product.inStock && (
                            <span className="inline-flex shrink-0 items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                              In Stock
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-xs font-medium text-slate-700 ml-1">{product.rating}</span>
                            <span className="text-xs text-slate-500 ml-1">({product.reviews} reviews)</span>
                          </div>
                          <AudioReaderButton
                            productName={product.name}
                            price={formatAmount(product.price)}
                            unit={product.minOrder}
                            supplierName={product.supplier}
                            variant="icon"
                            className="p-1 h-6 w-6 text-slate-400 hover:text-blue-700"
                          />
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-sm font-bold text-slate-900">
                              <span className="text-base font-extrabold">৳</span>
                              {formatAmount(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-slate-500 line-through ml-2">
                                <span className="text-sm font-bold">৳</span>
                                {formatAmount(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">Min order</span>
                            <span className="text-xs font-medium text-slate-700">{product.minOrder}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2 border-t border-slate-100">
                          <DirectContactButtons
                            phone={product.phone}
                            productName={product.name}
                            price={formatAmount(product.price)}
                            unit={product.minOrder}
                            supplierName={product.supplier}
                            variant="card"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            {/* Page indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToPage(index)}
                    aria-label={`Go to page ${index + 1}`}
                    aria-current={index === currentIndex}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-6 bg-blue-600 shadow-lg'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fadeIn_0\\.35s_ease\\] { animation: none; }
        }
      `}</style>
    </section>
  );
}