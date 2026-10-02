'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Package, X, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function SampleRequestModal({
  isOpen,
  onClose,
  product = null,
  supplier = null,
}) {
  const { isBn } = useLanguage();
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [sampleQuantity, setSampleQuantity] = useState('১-২ কেজি টেস্ট নমুনা');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const productName = product?.name || 'কাঁচামাল';
  const supplierName = supplier?.name || supplier?.companyName || product?.supplierName || 'প্রস্তুতকারক';
  const supplierPhone = supplier?.phone || product?.supplier?.phone || '01401658685';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim() || !deliveryAddress.trim()) {
      toast.error(isBn ? "অনুগ্রহ করে নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা দিন" : "Please provide name, phone and address");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/sample-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?._id || product?.id,
          productName,
          supplierName,
          supplierPhone,
          buyerName,
          buyerPhone,
          deliveryAddress,
          sampleQuantity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success(isBn ? "নমুনা অনুরোধ সফল হয়েছে!" : "Sample request sent successfully!");
      } else {
        toast.error(data.error || "সমস্যা হয়েছে, অনুগ্রহ করে ফোন করুন");
      }
    } catch (err) {
      toast.error(isBn ? "সার্ভারে সমস্যা হয়েছে" : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSend = () => {
    const text = `আসসালামু আলাইকুম ${supplierName}। আমি শিল্পমার্কেট থেকে আপনার "${productName}" পণ্যটি দেখেছি।\n\nআমি বাল্ক অর্ডারের আগে ${sampleQuantity} দেখতে চাই।\nআমার ডেলিভারি ঠিকানা: ${deliveryAddress}\nনাম: ${buyerName}\nমোবাইল: ${buyerPhone}\n\nকুরিয়ারে স্যাম্পল পাঠানোর নিয়ম ও খরচ জানাবেন।`;
    const cleanPhone = String(supplierPhone).replace(/\D/g, '');
    const targetPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-100 mb-2">
            <Package className="w-4 h-4 text-amber-300" />
            <span>{isBn ? "ট্রায়াল ও ল্যাব স্যাম্পল" : "Trial & Lab Sample"}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black">
            {isBn ? "নমুনার জন্য আবেদন করুন (Request Sample)" : "Request Raw Material Sample"}
          </h3>
          <p className="text-xs text-blue-100 mt-1 line-clamp-1">
            📦 {productName} • {supplierName}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ✓
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {isBn ? "নমুনার অনুরোধ গৃহীত হয়েছে!" : "Sample Request Dispatched!"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                {isBn
                  ? "সাপ্লায়ারকে আপনার ডেলিভারি ঠিকানাসহ নোটিফিকেশন পাঠানো হয়েছে। দ্রুত নিশ্চিত করতে নিচে হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন।"
                  : "Supplier has been notified with your shipping details. Send a quick WhatsApp to confirm immediately."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleWhatsAppSend}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <span>💬 সাপ্লায়ারকে হোয়াটসঅ্যাপ করুন</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                >
                  {isBn ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-[11px] font-semibold text-amber-900 flex items-start gap-2">
                <span className="text-base">💡</span>
                <span>
                  {isBn
                    ? "বড় অর্ডারের আগে কাঁচামালের গ্রেড ও কোয়ালিটি যাচাই করতে ১-২ কেজি নমুনা সংগ্রহ করুন। সাধারণত সুন্দরবন বা এসএ পরিবহনের মাধ্যমে কুরিয়ার খরচ গ্রাহক বহন করেন।"
                    : "Test 1-2 KG raw material sample before making volume payments. Sample delivery handled via local courier."}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? "আপনার নাম *" : "Your Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder={isBn ? "যেমন: মোহাম্মদ সেলিম" : "e.g. Salim Ahmed"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? "মোবাইল নম্বর *" : "Mobile Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? "নমুনার পরিমাণ" : "Sample Size"}
                  </label>
                  <select
                    value={sampleQuantity}
                    onChange={(e) => setSampleQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="৫০০ গ্রাম টেস্ট নমুনা">৫০০ গ্রাম (500g Test)</option>
                    <option value="১-২ কেজি টেস্ট নমুনা">১-২ কেজি (1-2 KG Trial)</option>
                    <option value="৫ কেজি পাইলট ব্যাচ">৫ কেজি (5 KG Pilot Batch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? "ডেলিভারি ঠিকানা ও কুরিয়ার পয়েন্ট *" : "Delivery Address & Courier Point *"}
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={isBn ? "দোকান/কারখানার ঠিকানা, থানা, জেলা (নিকটস্থ সুন্দরবন/এসএ পরিবহন শাখা)" : "Factory address, Thana, District, nearest courier branch"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/15 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isBn ? "নমুনার আবেদন পাঠান" : "Submit Sample Request"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppSend}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                >
                  <span>💬 WhatsApp</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
