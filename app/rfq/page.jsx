"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import PostRFQModal from "../../components/PostRFQModal"
import SubmitQuoteModal from "../../components/SubmitQuoteModal"
import DirectContactButtons from "../../components/DirectContactButtons"
import { useLanguage } from "../../contexts/LanguageContext"
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Clock,
  Building2,
  Package,
  MessageSquare,
  Phone,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Truck
} from "lucide-react"

function RFQBoardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [quoteModalRfq, setQuoteModalRfq] = useState(null);

  useEffect(() => {
    fetchRfqs();
  }, [selectedCategory, selectedDistrict]);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      let url = `/api/rfq?status=open`;
      if (selectedCategory !== 'all') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (selectedDistrict !== 'all') {
        url += `&district=${encodeURIComponent(selectedDistrict)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRfqs(data.rfqs || []);
      }
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: isBn ? "সব কাঁচামাল" : "All Materials" },
    { id: "ধাতব", name: isBn ? "🔩 লোহা ও স্টিল" : "Metals & Steel" },
    { id: "প্লাস্টিক", name: isBn ? "🧪 প্লাস্টিক দানা" : "Plastics" },
    { id: "সুতা", name: isBn ? "🧵 সুতা ও টেক্সটাইল" : "Yarn & Textile" },
    { id: "পাট", name: isBn ? "🌾 কাঁচা পাট" : "Raw Jute" },
    { id: "রাসায়নিক", name: isBn ? "⚗️ কেমিক্যাল ও রঙ" : "Chemicals" },
    { id: "নির্মাণ", name: isBn ? "🧱 সিমেন্ট ও নির্মাণ" : "Construction" },
  ];

  const districts = [
    { id: "all", name: isBn ? "সকল জেলা" : "All Districts" },
    { id: "ঢাকা", name: "ঢাকা (Dhaka)" },
    { id: "চট্টগ্রাম", name: "চট্টগ্রাম (Chittagong)" },
    { id: "নারায়ণগঞ্জ", name: "নারায়ণগঞ্জ (Narayanganj)" },
    { id: "গাজীপুর", name: "গাজীপুর (Gazipur)" },
    { id: "বগুড়া", name: "বগুড়া (Bogura)" },
    { id: "নরসিংদী", name: "নরসিংদী (Narsingdi)" },
    { id: "খুলনা", name: "খুলনা (Khulna)" },
  ];

  const filteredRfqs = rfqs.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.deliveryDistrict?.toLowerCase().includes(q) ||
      r.buyerCompany?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_70%)]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold tracking-wide uppercase">
                <FileText className="w-3.5 h-3.5" />
                {isBn ? "বাল্ক কাঁচামাল দরপত্র ও বিডিং" : "B2B Tender & RFQ Marketplace"}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {isBn 
                  ? "শিল্প কাঁচামালের দরপত্র আহ্বান ও কোটেশন বোর্ড"
                  : "Industrial Raw Materials Tender & Quote Board"}
              </h1>
              <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
                {isBn
                  ? "কারখানা মালিকরা তাদের প্রয়োজনীয় বাল্ক কাঁচামালের চাহিদা পোস্ট করেন এবং দেশের সেরা ভেরিফাইড মিল ও সরবরাহকারীরা সরাসরি সর্বনিম্ন দর দেন।"
                  : "Post your factory bulk requirements. Verified mills, importers and stockists submit their lowest wholesale price bids."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <PlusCircle className="w-5 h-5" />
                {isBn ? "দরপত্র আহ্বান করুন" : "Post Buy Requirement"}
              </button>
              <a
                href="tel:+8801401658685"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4 text-blue-300" />
                {isBn ? "হটলাইন সহায়তা" : "Hotline Help"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Board Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? "কাঁচামাল, জেলা বা কোম্পানির নাম দিয়ে খুঁজুন..." : "Search by material, grade, district or mill..."}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
              />
            </div>

            {/* District Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Active RFQ Counter Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1">
          <p className="font-semibold">
            {isBn ? "সক্রিয় দরপত্র সংখ্যা:" : "Active RFQs:"} <span className="text-blue-700 font-extrabold">{filteredRfqs.length}</span> {isBn ? "টি" : "demands"}
          </p>
          <span className="text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isBn ? "লাইভ আপডেট হচ্ছে" : "Live Bidding Active"}
          </span>
        </div>

        {/* RFQ List Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium">{isBn ? "দরপত্র লোড হচ্ছে..." : "Loading RFQs..."}</p>
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-700">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {isBn ? "কোনো দরপত্র পাওয়া যায়নি" : "No RFQs Found"}
            </h3>
            <p className="text-slate-500 text-sm">
              {isBn 
                ? "আপনার প্রয়োজনীয় কাঁচামালের প্রথম দরপত্রটি আপনিই পোস্ট করুন। সারা দেশের সেরা সাপ্লায়াররা আপনাকে সেরা দর দেবে।"
                : "Be the first to post your raw material requirement. Top suppliers across Bangladesh will bid competitive rates."}
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {isBn ? "নতুন দরপত্র আহ্বান করুন" : "Post First RFQ"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRfqs.map((rfq) => (
              <div
                key={rfq._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-5 sm:p-6 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {rfq.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      rfq.urgency === 'urgent'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {rfq.urgency === 'urgent' ? (isBn ? '🔴 অতীব জরুরি' : 'Urgent') : (isBn ? '🟢 উন্মুক্ত দরপত্র' : 'Open')}
                    </span>
                  </div>

                  {/* Title & Quantity */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1">
                      {rfq.title}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-blue-800 bg-blue-50/60 px-3 py-1 rounded-xl border border-blue-100">
                        {rfq.quantity} {rfq.unit}
                      </span>
                      {rfq.targetPrice > 0 ? (
                        <span className="text-xs text-slate-500 font-semibold">
                          বাজেট: ৳{rfq.targetPrice?.toLocaleString()}/{rfq.unit}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold italic">
                          (উন্মুক্ত দরপত্র)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description if present */}
                  {rfq.description && (
                    <p className="text-slate-600 text-xs line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {rfq.description}
                    </p>
                  )}

                  {/* Location & Details metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{rfq.deliveryDistrict}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{isBn ? `${rfq.deadlineDays || 7} দিনের মধ্যে` : `Within ${rfq.deadlineDays || 7} days`}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{rfq.buyerCompany || rfq.buyerName || (isBn ? 'শিল্পমার্কেট বায়ার' : 'Verified Buyer')}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-blue-700">{rfq.quoteCount || 0}</span> {isBn ? "টি কোটেশন জমা" : "quotes"}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Call Button */}
                    {rfq.buyerPhone && (
                      <a
                        href={`tel:${rfq.buyerPhone}`}
                        className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all"
                        title={isBn ? "সরাসরি কল করুন" : "Direct Call"}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {/* Submit Quote Button */}
                    <button
                      onClick={() => setQuoteModalRfq(rfq)}
                      className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {isBn ? "দর দিন" : "Submit Quote"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modals */}
      <PostRFQModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => fetchRfqs()}
      />

      {quoteModalRfq && (
        <SubmitQuoteModal
          isOpen={!!quoteModalRfq}
          rfq={quoteModalRfq}
          onClose={() => setQuoteModalRfq(null)}
          onSuccess={() => {
            fetchRfqs();
            setQuoteModalRfq(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function RFQBoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RFQBoardContent />
    </Suspense>
  );
}
