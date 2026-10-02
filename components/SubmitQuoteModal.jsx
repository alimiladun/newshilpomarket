"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useLanguage } from "../contexts/LanguageContext"
import {
  X,
  Send,
  DollarSign,
  Truck,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  Package
} from "lucide-react"

export default function SubmitQuoteModal({ isOpen, onClose, rfq, onSuccess }) {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offeredPrice: "",
    minOrderQuantity: rfq?.quantity || 1,
    deliveryDays: 2,
    transportIncluded: false,
    notes: "",
    supplierPhone: ""
  });

  if (!isOpen || !rfq) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(isBn ? 'দরপত্র দিতে অনুগ্রহ করে সাইন ইন করুন।' : 'Please login to submit a quote.');
      return;
    }

    if (!formData.offeredPrice || Number(formData.offeredPrice) <= 0) {
      toast.error(isBn ? 'আপনার অফারকৃত দর (প্রতি ইউনিট) লিখুন।' : 'Please enter your offered price per unit.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/rfq/${rfq._id}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(isBn ? 'আপনার কোটেশন সফলভাবে জমা হয়েছে!' : 'Quote submitted successfully!');
        if (onSuccess) onSuccess(data.quote);
        onClose();
      } else {
        toast.error(data.message || (isBn ? 'কোটেশন জমা ব্যর্থ হয়েছে।' : 'Failed to submit quote.'));
      }
    } catch (error) {
      console.error('Submit quote error:', error);
      toast.error(isBn ? 'সার্ভার এরর হয়েছে।' : 'Server error submitting quote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
            {isBn ? "সাপ্লায়ার কোটেশন বিডিং" : "Supplier Quote Bidding"}
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            {isBn ? "দরপত্র কোটেশন জমা দিন" : "Submit Competitive Quote"}
          </h3>

          {/* Quick RFQ Summary */}
          <div className="mt-3 bg-white/10 border border-white/20 rounded-xl p-3 text-xs space-y-1">
            <p className="font-bold text-white text-sm truncate">{rfq.title}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-blue-100">
              <span>📦 {rfq.quantity} {rfq.unit}</span>
              <span>📍 {rfq.deliveryDistrict}</span>
              {rfq.targetPrice > 0 && (
                <span>💰 বাজেট: ৳{rfq.targetPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              {isBn ? `আপনার অফারকৃত দর (৳ প্রতি ${rfq.unit})` : `Your Offered Price (৳ per ${rfq.unit})`}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-base">৳</span>
              <input
                type="number"
                value={formData.offeredPrice}
                onChange={(e) => handleInputChange("offeredPrice", e.target.value)}
                placeholder={isBn ? "যেমন: ৮৫০০০" : "e.g. 85000"}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-base text-slate-900 font-extrabold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "সরবরাহের সময় (দিন)" : "Lead Time (Days)"}
              </label>
              <input
                type="number"
                value={formData.deliveryDays}
                onChange={(e) => handleInputChange("deliveryDays", Number(e.target.value))}
                min="1"
                placeholder="২"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "যোগাযোগের ফোন নম্বর" : "Contact Phone"}
              </label>
              <input
                type="tel"
                value={formData.supplierPhone}
                onChange={(e) => handleInputChange("supplierPhone", e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Transport Included Checkbox */}
          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.transportIncluded}
              onChange={(e) => handleInputChange("transportIncluded", e.target.checked)}
              className="w-4 h-4 text-blue-700 rounded focus:ring-blue-600"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-slate-800">
                {isBn ? "🚚 এই দরে ট্রাক পরিবহন ভাড়া অন্তর্ভুক্ত" : "🚚 Transport delivery fee included in this quote"}
              </span>
              <p className="text-slate-500">
                {isBn ? "টিক দেওয়া থাকলে ক্রেতাকে বাড়তি ট্রাক ভাড়া দিতে হবে না।" : "Buyer will not need to pay extra logistics charges."}
              </p>
            </div>
          </label>

          {/* Notes & Guarantees */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              {isBn ? "মালের শর্তাবলী ও নিশ্চয়তা নোট" : "Terms & Quality Guarantees"}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
              placeholder={isBn ? "যেমন: মিল টেস্ট সার্টিফিকেট সহ, ওজন স্কেল রিসিট নিশ্চিত..." : "e.g. Mill test certificate attached, verified weight scale..."}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900"
            />
          </div>

          {/* Submit Action */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isBn ? "জমা হচ্ছে..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isBn ? "কোটেশন পাঠান" : "Submit Quote"}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
