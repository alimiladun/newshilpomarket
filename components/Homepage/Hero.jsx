'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import HeroSearchbar from "./HeroSearchbar";

const stats = [
  { value: "50,000+", label: "Products Listed", icon: "📦" },
  { value: "8,500+", label: "Verified Suppliers", icon: "✅" },
  { value: "৳2B+", label: "Transactions Done", icon: "💰" },
  { value: "120+", label: "Countries Reached", icon: "🌐" },
];

const quickCategories = [
  { label: "Steel & Metals", icon: "🔩", slug: "metals-alloys" },
  { label: "Chemicals", icon: "⚗️", slug: "chemicals-materials" },
  { label: "Textiles", icon: "🧵", slug: "textiles-fabrics" },
  { label: "Electronics", icon: "⚡", slug: "electronics-components" },
  { label: "Agriculture", icon: "🌾", slug: "agriculture-food" },
  { label: "Construction", icon: "🏗️", slug: "construction-building" },
];

const trendingSearches = ["Steel Rods", "Cotton Fiber", "Copper Wire", "Plastic Pellets", "Aluminum Sheets"];

const featuredItems = [
  { name: "Premium Steel Rods", supplier: "MetalCorp BD", price: "৳1,250/ton", tag: "🔥 Trending", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
  { name: "Organic Cotton Fiber", supplier: "EcoTextile Co.", price: "৳2,100/ton", tag: "⭐ Top Rated", img: "https://images.unsplash.com/photo-1516110833967-0b5ee0d1c86c?w=80&h=80&fit=crop" },
  { name: "Industrial Chemicals", supplier: "ChemCore Ltd.", price: "৳850/ton", tag: "✅ Verified", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=80&h=80&fit=crop" },
];

export default function Hero() {
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % stats.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden flex items-center justify-center py-16 lg:py-0 min-h-[92vh]">

        {/* ── Background ── */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 hero-bg-image"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl anim-pulse-slow"></div>
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl anim-pulse-slow" style={{animationDelay:"3s"}}></div>
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:"linear-gradient(rgba(99,102,241,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.3) 1px,transparent 1px)", backgroundSize:"72px 72px"}}
          ></div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 lg:min-h-[92vh] py-16 lg:py-0">

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="flex-1 w-full text-center lg:text-left">

            {/* Badge */}
            <div className="flex justify-center lg:justify-start mb-5 anim-fade-up" style={{animationDelay:"0s"}}>
              <span className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Bangladesh's #1 Raw Material B2B Marketplace
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-4 anim-fade-up" style={{animationDelay:"0.1s"}}>
              <span className="text-white">Source Industrial</span>
              <br />
              <span className="shimmer-text">Raw Materials.</span>
              <br />
              <span className="text-white text-2xl sm:text-3xl xl:text-4xl font-bold opacity-85">Smarter. Faster. Verified.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light mb-6 anim-fade-up" style={{animationDelay:"0.15s"}}>
              Connect directly with thousands of verified suppliers across steel, chemicals, textiles, and more — all in one secure platform.
            </p>

            {/* Searchbar */}
            <div className="anim-fade-up" style={{animationDelay:"0.2s"}}>
              <HeroSearchbar />
            </div>

            {/* Trending */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6 anim-fade-up" style={{animationDelay:"0.25s"}}>
              <span className="text-slate-400 text-xs">Trending:</span>
              {trendingSearches.map((term) => (
                <Link
                  key={term}
                  href={`/products?search=${encodeURIComponent(term)}`}
                  className="text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/10 px-3 py-1 rounded-full transition-all duration-200"
                >
                  {term}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 anim-fade-up" style={{animationDelay:"0.3s"}}>
              <Link
                href="/products"
                className="group bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Browse 50,000+ Products
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/sellers"
                className="group glass hover:bg-white/15 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                Find Suppliers
              </Link>
              <Link
                href="/auth/signup"
                className="group border border-white/20 hover:border-white/45 text-white hover:bg-white/10 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Selling
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">Free</span>
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-5 border-t border-white/10 anim-fade-up" style={{animationDelay:"0.35s"}}>
              {[
                { icon: "🔒", text: "256-bit SSL" },
                { icon: "✅", text: "Verified Suppliers" },
                { icon: "🚚", text: "Fast Delivery" },
                { icon: "💬", text: "24/7 Support" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════ RIGHT COLUMN ════════════ */}
          <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col gap-4">

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 anim-slide-right" style={{animationDelay:"0.2s"}}>
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className={`glass rounded-2xl p-4 text-center transition-all duration-500 ${
                    activeStatIndex === i ? "stat-active" : "hover:bg-white/12"
                  }`}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{stat.value}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Featured product cards */}
            <div className="hidden lg:flex flex-col gap-3 anim-slide-right" style={{animationDelay:"0.3s"}}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-semibold">Live Products</span>
                <Link href="/products" className="text-blue-400 hover:text-blue-300 text-xs transition-colors">View all →</Link>
              </div>
              {featuredItems.map((item, i) => (
                <div
                  key={i}
                  className={`glass-bright rounded-xl p-3 flex items-center gap-3 hover:bg-white/18 transition-all duration-300 cursor-pointer ${
                    i === 0 ? "anim-float" : i === 1 ? "anim-float-2" : "anim-float-3"
                  }`}
                >
                  <img src={item.img} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-semibold truncate">{item.name}</div>
                    <div className="text-slate-400 text-xs truncate">{item.supplier}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-emerald-400 text-sm font-bold">{item.price}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.tag}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick categories */}
            {/* <div className="anim-slide-right" style={{animationDelay:"0.4s"}}>
              <div className="text-white text-sm font-semibold mb-2">Browse Categories</div>
              <div className="grid grid-cols-3 gap-2">
                {quickCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="glass hover:bg-white/15 text-white text-xs font-medium px-2 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="leading-tight">{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div> */}

          </div>
          {/* ═══════════════════════════════════ */}

        </div>
      </section>
    </>
  );
}