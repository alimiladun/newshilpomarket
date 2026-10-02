'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TopCategories({ topCategories = [] }) {
  const { t, isBn } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(topCategories.length / itemsPerPage);

  useEffect(() => {
    if (topCategories.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === totalPages - 1 ? 0 : prevIndex + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [totalPages, topCategories.length]);

  const currentCategories = topCategories.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  // Don't render if no categories
  if (!topCategories || topCategories.length === 0) {
    return null;
  }
  
  return (
    <section className="group h-full rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1">
      <div className="h-1 bg-gradient-to-r from-slate-600 via-slate-300 to-blue-400" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center mr-3 shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isBn ? "শীর্ষ কাঁচামাল ক্যাটাগরি" : "Top Categories"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 max-w-md">
                {isBn ? "সবচেয়ে বেশি চাহিদাসম্পন্ন কাঁচামাল সহজে খুঁজুন।" : "Explore our most popular product categories."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              {isBn ? "সকল ক্যাটাগরি" : "View All Categories"}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="space-y-3 h-[560px] overflow-hidden">
            {currentCategories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <div className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer mb-6 h-[270px] flex flex-col">
                  <div className="relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    {category.featured && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        ⭐ Featured
                      </div>
                    )}
                    {category.trending && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        🔥 Trending
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">
                            {category.name}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">{category.description}</p>
                        </div>
                        {category.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-4">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-xs font-medium text-slate-700 ml-1">{category.rating}</span>
                          <span className="text-xs text-slate-500 ml-1">({category.suppliers} suppliers)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{category.productCount} Products</span>
                        {category.subCategories && (
                          <span className="text-xs text-slate-500 ml-2">{category.subCategories} subcategories</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Starting from</span>
                        <span className="text-xs font-medium text-slate-700">
                          {category.priceRange.split('৳').map((part, i) =>
                            i === 0 ? part : <span key={i}><span className="text-sm font-extrabold">৳</span>{part}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Slider indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-slate-600 shadow-lg' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
