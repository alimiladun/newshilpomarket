'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Phone, CheckCircle2, X, Building2, UserCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MARKETPLACE_HOTLINE, getDirectCallUrl, getWhatsAppUrl } from '../lib/communication';

export default function AssistedTradeModal({ isOpen, onClose, initialMaterial = '' }) {
  const { isBn } = useLanguage();
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [materialNeeded, setMaterialNeeded] = useState(initialMaterial);
  const [approxQuantity, setApproxQuantity] = useState('১০+ টন');
  const [targetLocation, setTargetLocation] = useState('ঢাকা');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buyerName.trim() || !phone.trim() || !materialNeeded.trim()) {
      toast.error(isBn ? "অনুগ্রহ করে নাম, ফোন নম্বর ও মালের বিবরণ দিন" : "Please provide name, phone and material");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/assisted-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName,
          phone,
          materialNeeded,
          approxQuantity,
          targetLocation,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success(isBn ? "অনুরোধ সফল হয়েছে!" : "Request submitted successfully!");
      } else {
        toast.error(data.error || "সমস্যা হয়েছে, অনুগ্রহ করে ফোন করুন");
      }
    } catch (err) {
      toast.error(isBn ? "সার্ভারে সমস্যা হয়েছে" : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = `আসসালামু আলাইকুম। আমি বড় অর্ডারে শিল্পমার্কেট ট্রেড অ্যাসিস্ট্যান্ট সার্ভিস নিতে চাই।\nপণ্য: ${materialNeeded || 'কাঁচামাল'}\nপরিমাণ: ${approxQuantity}\nনাম: ${buyerName}\nমোবাইল: ${phone}\nঠিকানা: ${targetLocation}`;
    window.open(`https://wa.me/8801401658685?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isBn ? "শিল্পমার্কেট নিশ্চিত ট্রেড সার্ভিস" : "ShilpoMarket Trade Assistance"}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black">
            {isBn ? "বড় অর্ডারে প্রতিনিধি সহায়তা বুক করুন" : "Book Trade Verification Agent"}
          </h3>
          <p className="text-xs text-blue-200 mt-1 leading-relaxed">
            {isBn
              ? "আমাদের প্রতিনিধি আপনার হয়ে মিলে গিয়ে পণ্যের মান, গ্রেড ও ওজন সরেজমিনে পরিদর্শন করবে।"
              : "Our verified trade agent will physically inspect materials at the mill before you make payment."}
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
                {isBn ? "অনুরোধ গ্রহণ করা হয়েছে!" : "Request Received!"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                {isBn
                  ? "আমাদের ট্রেড কনসালট্যান্ট ৩০ মিনিটের মধ্যে আপনার সাথে যোগাযোগ করবে। জরুরি প্রয়োজনে সরাসরি আমাদের হটলাইনে কল করতে পারেন।"
                  : "Our trade agent will contact you within 30 minutes. You can also dial our hotline directly."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`tel:${MARKETPLACE_HOTLINE}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isBn ? "হটলাইনে কল করুন: ০১৪০১-৬৫৮৬৮৫" : "Call Hotline"}</span>
                </a>
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
              
              {/* Trust Value Points */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] font-semibold text-blue-900">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isBn ? "মিল পরিদর্শন ও টেস্ট" : "On-site quality test"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{isBn ? "নিরাপদ লেনদেন সহায়তা" : "Safe trade guarantee"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? "আপনার নাম (Your Name) *" : "Your Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder={isBn ? "যেমন: মোহাম্মদ রফিকুল ইসলাম" : "e.g. Rafiqul Islam"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? "মোবাইল নম্বর (Phone) *" : "Mobile Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? "কাঁচামালের পরিমাণ (Quantity)" : "Quantity"}
                  </label>
                  <input
                    type="text"
                    value={approxQuantity}
                    onChange={(e) => setApproxQuantity(e.target.value)}
                    placeholder="যেমন: ৫০ টন"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? "কাঁচামালের নাম ও স্পেসিফিকেশন *" : "Raw Material Details *"}
                </label>
                <input
                  type="text"
                  required
                  value={materialNeeded}
                  onChange={(e) => setMaterialNeeded(e.target.value)}
                  placeholder={isBn ? "যেমন: ৬০-গ্রেড BSRM রড বা ভার্জিন পিপি প্লাস্টিক দানা" : "e.g. 60-Grade Rebar or PP Granules"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? "ডেলিভারি এলাকা বা মিল লোকেশন" : "Target Mill Location / District"}
                </label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  placeholder={isBn ? "যেমন: ডেমরা, ঢাকা / সীতাকুণ্ড, চট্টগ্রাম" : "e.g. Demra, Dhaka"}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/15 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isBn ? "প্রতিনিধি বুকিং নিশ্চিত করুন" : "Confirm Agent Booking"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                >
                  <span>💬 WhatsApp</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-500 font-medium">
                {isBn ? "📞 তাৎক্ষণিক সহায়তায় কল করুন: ০১৪০১-৬৫৮৬৮৫" : "Need urgent help? Call: 01401-658685"}
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
