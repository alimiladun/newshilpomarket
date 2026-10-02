"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"
import SubmitQuoteModal from "../../../components/SubmitQuoteModal"
import Link from "next/link"
import { toast } from "sonner"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  FileText,
  MapPin,
  Clock,
  Building2,
  Package,
  Phone,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Truck,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Send
} from "lucide-react"

function SingleRFQContent({ params }) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const rfqId = unwrappedParams?.id || routeParams?.id;
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  useEffect(() => {
    if (rfqId) {
      fetchRfqDetails();
    }
  }, [rfqId]);

  const fetchRfqDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/rfq/${rfqId}`, { headers });
      const data = await res.json();
      if (data.success) {
        setRfq(data.rfq);
      } else {
        toast.error(isBn ? 'দরপত্র পাওয়া যায়নি' : 'RFQ not found');
      }
    } catch (err) {
      console.error('Fetch RFQ details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/rfq/${rfqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'accept_quote',
          quoteId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isBn ? 'কোটেশন গ্রহণ করা হয়েছে!' : 'Quote accepted successfully!');
        fetchRfqDetails();
      }
    } catch (err) {
      console.error('Accept quote error:', err);
      toast.error('Failed to accept quote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full mx-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">{isBn ? 'দরপত্র খুঁজে পাওয়া যায়নি' : 'RFQ Not Found'}</h2>
            <Link href="/rfq" className="inline-block mt-4 text-blue-700 font-bold hover:underline">
              ← {isBn ? 'দরপত্র বোর্ডে ফিরে যান' : 'Back to RFQ Board'}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Back navigation */}
        <Link
          href="/rfq"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isBn ? "দরপত্র বোর্ডে ফিরে যান" : "Back to RFQ Board"}
        </Link>

        {/* Main Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {rfq.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{rfq.rfqNumber}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  rfq.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {rfq.status === 'open' ? (isBn ? '🟢 উন্মুক্ত' : 'Open') : rfq.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {rfq.title}
              </h1>
            </div>

            {/* Price / Target Budget Badge */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left sm:text-right flex-shrink-0">
              <span className="text-xs text-slate-500 font-semibold block">{isBn ? "প্রয়োজনীয় পরিমাণ" : "Required Volume"}</span>
              <span className="text-2xl font-black text-blue-800">
                {rfq.quantity} {rfq.unit}
              </span>
              {rfq.targetPrice > 0 && (
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  বাজেট: ৳{rfq.targetPrice?.toLocaleString()}/{rfq.unit}
                </p>
              )}
            </div>
          </div>

          {/* Description & Technical Notes */}
          {rfq.description && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                {isBn ? "কারিগরি স্পেসিফিকেশন ও বিবরণ" : "Technical Specifications & Notes"}
              </h4>
              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {rfq.description}
              </p>
            </div>
          )}

          {/* Logistics & Buyer Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>{isBn ? "ডেলিভারি লোকেশন" : "Delivery Location"}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{rfq.deliveryDistrict}</p>
              {rfq.deliveryAddress && (
                <p className="text-xs text-slate-600 mt-1">{rfq.deliveryAddress}</p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>{isBn ? "সময়সীমা ও জরুরি লেভেল" : "Deadline & Urgency"}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {isBn ? `${rfq.deadlineDays || 7} দিনের মধ্যে ডেলিভারি` : `Within ${rfq.deadlineDays || 7} days`}
              </p>
              <span className="inline-block mt-1 text-[11px] font-bold text-blue-700">
                {rfq.urgency === 'urgent' ? 'অতীব জরুরি' : 'স্বাভাবিক সরবরাহ'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>{isBn ? "ক্রেতা / কারখানা" : "Buyer Organization"}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm truncate">{rfq.buyerCompany || rfq.buyerName}</p>
              <div className="flex gap-2 mt-2">
                {rfq.buyerPhone && (
                  <a
                    href={`tel:${rfq.buyerPhone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {isBn ? "কল করুন" : "Call"}
                  </a>
                )}
                {rfq.buyerPhone && (
                  <a
                    href={`https://wa.me/88${rfq.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `হ্যালো, শিল্পমার্কেটে আপনার দরপত্র #${rfq.rfqNumber} (${rfq.title}) দেখেছি। কোটেশন দিতে চাই।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    {isBn ? "হোয়াটসঅ্যাপ" : "WhatsApp"}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Submit Quote Action Button */}
          {rfq.status === 'open' && !rfq.isOwner && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-600">
                {isBn 
                  ? "আপনি কি এই কাঁচামালের পাইকারি সরবরাহকারী? এখনই আপনার সেরা রেট দিয়ে কোটেশন জমা দিন।"
                  : "Are you a verified supplier for this material? Submit your best wholesale quote now."}
              </p>
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                {isBn ? "কোটেশন দর জমা দিন" : "Submit Quote"}
              </button>
            </div>
          )}
        </div>

        {/* Competing Quotes Section (Visible to Owner) */}
        {rfq.isOwner && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isBn ? "জমাকৃত দরপত্রসমূহ (Supplier Quotes)" : "Submitted Supplier Quotes"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn ? "সাপ্লায়ারদের দেওয়া রেট তুলনা করুন এবং সেরা কোটেশনটি গ্রহণ করুন।" : "Compare supplier price bids and accept the best quote."}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 font-extrabold text-xs rounded-full">
                {rfq.quotes?.length || 0} {isBn ? "টি দর জমা" : "Quotes"}
              </span>
            </div>

            {(!rfq.quotes || rfq.quotes.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                {isBn ? "এখনো কোনো কোটেশন জমা পড়েনি। কিছুক্ষণের মধ্যে ভেরিফাইড সাপ্লায়াররা দর দেবেন।" : "No quotes submitted yet. Suppliers will submit bids shortly."}
              </div>
            ) : (
              <div className="space-y-3">
                {rfq.quotes.map((q, idx) => (
                  <div
                    key={q._id || idx}
                    className={`border-2 rounded-2xl p-4 sm:p-5 transition-all ${
                      q.status === 'accepted' ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{q.supplierCompany || q.supplierName}</h4>
                          {q.status === 'accepted' && (
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                              ✓ {isBn ? "গৃহীত কোটেশন" : "Accepted"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span>⏱️ {isBn ? `${q.deliveryDays || 2} দিনে সরবরাহ` : `${q.deliveryDays || 2} days lead time`}</span>
                          <span>{q.transportIncluded ? (isBn ? "🚚 পরিবহন অন্তর্ভুক্ত" : "🚚 Transport Included") : (isBn ? "মিল গেট পিকআপ" : "Ex-Mill")}</span>
                        </p>
                        {q.notes && (
                          <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                            &ldquo;{q.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2">
                        <div>
                          <span className="text-xl sm:text-2xl font-black text-blue-800">
                            ৳{q.offeredPrice?.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">/ {rfq.unit}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {q.supplierPhone && (
                            <a
                              href={`tel:${q.supplierPhone}`}
                              className="p-2 bg-slate-100 hover:bg-blue-100 text-blue-700 rounded-xl transition-all"
                              title="Call Supplier"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          {q.status !== 'accepted' && rfq.status === 'open' && (
                            <button
                              onClick={() => handleAcceptQuote(q._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                            >
                              {isBn ? "গ্রহণ করুন" : "Accept"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Quote Submission Modal */}
      {quoteModalOpen && (
        <SubmitQuoteModal
          isOpen={quoteModalOpen}
          rfq={rfq}
          onClose={() => setQuoteModalOpen(false)}
          onSuccess={() => {
            fetchRfqDetails();
            setQuoteModalOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function SingleRFQPage({ params }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SingleRFQContent params={params} />
    </Suspense>
  );
}
