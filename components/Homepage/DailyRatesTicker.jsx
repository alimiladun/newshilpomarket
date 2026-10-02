'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { TrendingUp, TrendingDown, Minus, ArrowRight, RefreshCw, MapPin, Building2 } from 'lucide-react';

export default function DailyRatesTicker() {
  const { isBn, toBanglaNumber } = useLanguage();
  const [rates, setRates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, [activeCategory]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const url = activeCategory === 'all' 
        ? '/api/market-rates' 
        : `/api/market-rates?category=${activeCategory}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRates(data.rates || []);
      }
    } catch (err) {
      console.error('Error fetching market rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: isBn ? "সকল কাঁচামাল" : "All Commodities" },
    { id: 'steel', name: isBn ? "রড ও মেটাল" : "Steel & Rebar" },
    { id: 'scrap', name: isBn ? "স্ক্র্যাপ" : "Scrap Metal" },
    { id: 'plastic', name: isBn ? "প্লাস্টিক দানা" : "Plastics" },
    { id: 'textile', name: isBn ? "তুলা ও সুতা" : "Cotton & Yarn" },
    { id: 'jute', name: isBn ? "কাঁচা পাট" : "Raw Jute" },
    { id: 'cement', name: isBn ? "সিমেন্ট" : "Cement" },
    { id: 'chemical', name: isBn ? "রাসায়নিক" : "Chemicals" },
  ];

  return (
    <section className="relative py-8 bg-slate-900 text-white overflow-hidden border-y border-slate-800">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row with Live Indicator & Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Live Blinking Indicator */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-red-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>{isBn ? "লাইভ বাজার দর" : "Live Market Rates"}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isBn ? "আজকের কাঁচামালের পাইকারি রেট" : "Daily Raw Material Wholesale Rates"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {isBn ? "খাতুনগঞ্জ, বাবুবাজার, ডেমরা ও নারায়ণগঞ্জের বাজার" : "Dhaka, Chittagong & Narayanganj Hubs"}
            </span>

            <Link
              href="/market-rates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 px-3.5 py-1.5 rounded-full transition-all"
            >
              <span>{isBn ? "সম্পূর্ণ তালিকা দেখুন" : "View Full Board"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Commodity Rate Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rates.slice(0, 8).map((item, idx) => {
              const isUp = item.trend === 'up';
              const isDown = item.trend === 'down';
              const changePercent = item.prevPrice 
                ? (((item.price - item.prevPrice) / item.prevPrice) * 100).toFixed(1)
                : '0.0';

              return (
                <div
                  key={item._id || idx}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-blue-950/40"
                >
                  <div>
                    {/* Top Row: Quality Grade + Trend Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-slate-400 truncate">
                        {item.qualityGrade || (isBn ? "প্রিমিয়াম মান" : "Premium Grade")}
                      </span>
                      
                      {isUp && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full shrink-0">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{isBn ? toBanglaNumber(changePercent) : changePercent}%</span>
                        </span>
                      )}
                      {isDown && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full shrink-0">
                          <TrendingDown className="w-3 h-3" />
                          <span>{isBn ? toBanglaNumber(changePercent) : changePercent}%</span>
                        </span>
                      )}
                      {!isUp && !isDown && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full shrink-0">
                          <Minus className="w-3 h-3" />
                          <span>{isBn ? "স্থির" : "Stable"}</span>
                        </span>
                      )}
                    </div>

                    {/* Material Title */}
                    <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors">
                      {isBn ? item.materialName : item.materialNameEn}
                    </h3>

                    {/* Price and Unit */}
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-xl sm:text-2xl font-black text-blue-400 tracking-tight">
                        ৳{isBn ? toBanglaNumber(item.price.toLocaleString()) : item.price.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        /{isBn ? item.unit : item.unitEn}
                      </span>
                    </div>

                    {/* Market Hub */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{isBn ? item.marketHub : item.marketHubEn}</span>
                    </div>
                  </div>

                  {/* Bottom Action: Direct Search & Buy Link */}
                  <Link
                    href={`/products?search=${encodeURIComponent(isBn ? item.materialName.split(' ')[0] : item.materialNameEn.split(' ')[0])}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700/60 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all duration-150"
                  >
                    <span>{isBn ? "কাঁচামাল খুঁজুন" : "Find Suppliers"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
