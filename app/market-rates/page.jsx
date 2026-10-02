'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductHeader from '../../components/ProductHeader';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  ArrowRight,
  Phone,
  ShieldCheck,
  Building2,
  Calendar,
  Search,
  Filter
} from 'lucide-react';

export default function MarketRatesPage() {
  const { isBn, toBanglaNumber } = useLanguage();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/market-rates');
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
    { id: 'all', name: isBn ? "সকল কাঁচামাল" : "All Materials" },
    { id: 'steel', name: isBn ? "রড ও স্টিল" : "Steel & Rebar" },
    { id: 'scrap', name: isBn ? "স্ক্র্যাপ লোহা" : "Scrap Metal" },
    { id: 'plastic', name: isBn ? "প্লাস্টিক পলিমার" : "Plastics" },
    { id: 'textile', name: isBn ? "তুলা ও সুতা" : "Cotton & Yarn" },
    { id: 'jute', name: isBn ? "কাঁচা পাট" : "Raw Jute" },
    { id: 'cement', name: isBn ? "সিমেন্ট" : "Cement" },
    { id: 'chemical', name: isBn ? "শিল্প রাসায়নিক" : "Chemicals" },
  ];

  const filteredRates = rates.filter((r) => {
    const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      r.materialName?.toLowerCase().includes(term) ||
      r.materialNameEn?.toLowerCase().includes(term) ||
      r.marketHub?.toLowerCase().includes(term);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <ProductHeader />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Hero Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-xl shadow-blue-950/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isBn ? "লাইভ আপডেট • আজ সকাল ১০:০০ টা" : "Live Update • Today 10:00 AM"}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
                {isBn ? "আজকের কাঁচামালের পাইকারি বাজার দর" : "Today's Wholesale Raw Material Rates"}
              </h1>

              <p className="text-slate-300 text-xs sm:text-base leading-relaxed mb-6 font-normal">
                {isBn
                  ? "খাতুনগঞ্জ, বাবুবাজার, ডেমরা, নারায়ণগঞ্জ ও বগুড়ার পাইকারি বাজার থেকে যাচাইকৃত দৈনিক বাজার দর। কারখানা দর জানতে ও সরাসরি মিল মালিকদের থেকে কিনতে ক্লিক করুন।"
                  : "Daily verified wholesale prices from major trading hubs across Bangladesh. Connect directly with mills and factories for volume orders."}
              </p>

              {/* Direct Hotline Consultation */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                <a
                  href="tel:+8801401658685"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isBn ? "রেট নিশ্চিত করতে কল করুন: ০১৪০১-৬৫৮৬৮৫" : "Call to Confirm Rates: 01401-658685"}</span>
                </a>

                <span className="text-slate-400 font-medium">
                  {isBn ? "✓ কোনো দালাল বা কমিশন নেই" : "✓ Zero Broker Fee"}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder={isBn ? "কাঁচামাল বা বাজারের নাম..." : "Filter commodity..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

          </div>

          {/* Rates Table (Desktop) / Cards (Mobile) */}
          {loading ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
              <p className="text-slate-600 text-sm font-semibold">{isBn ? "আজকের দর লোড হচ্ছে..." : "Loading daily rates..."}</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-4 px-6">{isBn ? "কাঁচামালের নাম ও গ্রেড" : "Material & Grade"}</th>
                      <th className="py-4 px-6">{isBn ? "পাইকারি দর" : "Wholesale Price"}</th>
                      <th className="py-4 px-6">{isBn ? "দৈনিক পরিবর্তন" : "24h Trend"}</th>
                      <th className="py-4 px-6">{isBn ? "বাজার ও হাব" : "Market Hub"}</th>
                      <th className="py-4 px-6 text-right">{isBn ? "পদক্ষেপ" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRates.map((item, idx) => {
                      const isUp = item.trend === 'up';
                      const isDown = item.trend === 'down';
                      const changePercent = item.prevPrice 
                        ? (((item.price - item.prevPrice) / item.prevPrice) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <tr key={item._id || idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 text-sm sm:text-base">
                              {isBn ? item.materialName : item.materialNameEn}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                              {item.qualityGrade}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="text-base sm:text-lg font-black text-blue-700">
                              ৳{isBn ? toBanglaNumber(item.price.toLocaleString()) : item.price.toLocaleString()}
                              <span className="text-xs font-semibold text-slate-500 ml-1">
                                /{isBn ? item.unit : item.unitEn}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {isBn ? "আগের দর: " : "Prev: "}৳{isBn ? toBanglaNumber(item.prevPrice) : item.prevPrice}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {isUp && (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>+{isBn ? toBanglaNumber(changePercent) : changePercent}%</span>
                              </span>
                            )}
                            {isDown && (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full text-xs">
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>{isBn ? toBanglaNumber(changePercent) : changePercent}%</span>
                              </span>
                            )}
                            {!isUp && !isDown && (
                              <span className="inline-flex items-center gap-1 font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs">
                                <Minus className="w-3.5 h-3.5" />
                                <span>{isBn ? "অপরিবর্তিত" : "Stable"}</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{isBn ? item.marketHub : item.marketHubEn}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/products?search=${encodeURIComponent(isBn ? item.materialName.split(' ')[0] : item.materialNameEn.split(' ')[0])}`}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                              <span>{isBn ? "বিক্রেতা দেখুন" : "View Sellers"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Information Notice */}
          <div className="mt-8 bg-blue-50/80 border border-blue-200 rounded-2xl p-5 text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-blue-900 mb-1">
              📌 {isBn ? "বাজার দর নির্দেশিকা ও তথ্যসূত্র:" : "Market Rate Guidance:"}
            </p>
            <p>
              {isBn
                ? "এখানে প্রদর্শিত দর প্রতিদিন দেশের শীর্ষ পাইকারি আড়ত ও মিল থেকে সংগ্রহ করা হয়। পরিমাণ, পরিবহন খরচ এবং পেমেন্ট শর্তের ভিত্তিতে মিল টু মিল মূল্যের সামান্য পার্থক্য হতে পারে। বড় চালানের জন্য সরাসরি মিল মালিকের সাথে কথা বলুন।"
                : "Prices are updated daily from major trade hubs and mills. Actual factory prices may vary slightly based on volume, transport logistics, and credit terms."}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
