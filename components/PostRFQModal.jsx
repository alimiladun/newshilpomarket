"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLanguage } from "../contexts/LanguageContext"
import {
  X,
  FileText,
  Package,
  MapPin,
  Clock,
  Phone,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Truck
} from "lucide-react"

export default function PostRFQModal({ isOpen, onClose, onSuccess }) {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "ধাতব ও লোহা (Metals & Steel)",
    quantity: "",
    unit: "টন",
    targetPrice: "",
    deliveryDistrict: "ঢাকা (Dhaka)",
    deliveryAddress: "",
    deadlineDays: 7,
    urgency: "standard",
    contactPhone: "",
    buyerCompany: "",
    description: ""
  });

  if (!isOpen) return null;

  const categories = [
    { id: "metals", name: isBn ? "ধাতব ও লোহা (Metals & Steel)" : "Metals & Steel" },
    { id: "plastics", name: isBn ? "প্লাস্টিক ও পলিমার (Plastics & Polymers)" : "Plastics & Polymers" },
    { id: "textile", name: isBn ? "সুতা ও টেক্সটাইল (Yarn & Textile)" : "Yarn & Textile" },
    { id: "jute", name: isBn ? "কাঁচা পাট ও পণ্য (Raw Jute & Products)" : "Raw Jute & Allied" },
    { id: "chemicals", name: isBn ? "রাসায়নিক ও রঙ (Industrial Chemicals & Dyes)" : "Chemicals & Dyes" },
    { id: "construction", name: isBn ? "সিমেন্ট, রড ও নির্মাণ (Construction & Cement)" : "Construction Materials" },
    { id: "packaging", name: isBn ? "প্যাকেজিং ও কার্টন (Packaging & Corrugated)" : "Packaging & Cartons" },
    { id: "agriculture", name: isBn ? "কৃষি কাঁচামাল ও খাদ্য (Agro Raw Materials)" : "Agro Raw Materials" },
  ];

  const units = [
    { id: "টন", name: isBn ? "টন (Ton)" : "Ton" },
    { id: "মণ", name: isBn ? "মণ (Mon - 40kg)" : "Mon (40kg)" },
    { id: "কেজি", name: isBn ? "কেজি (Kg)" : "Kg" },
    { id: "বস্তা", name: isBn ? "বস্তা (Bag - 50kg)" : "Bag (50kg)" },
    { id: "ড্রাম", name: isBn ? "ড্রাম (Drum - 200L)" : "Drum" },
    { id: "বেল", name: isBn ? "বেল (Bale)" : "Bale" },
    { id: "মিটার", name: isBn ? "মিটার (Meter)" : "Meter" },
  ];

  const districts = [
    "ঢাকা (Dhaka)",
    "চট্টগ্রাম (Chittagong)",
    "নারায়ণগঞ্জ (Narayanganj)",
    "গাজীপুর (Gazipur)",
    "বগুড়া (Bogura)",
    "নরসিংদী (Narsingdi)",
    "খুলনা (Khulna)",
    "রাজশাহী (Rajshahi)",
    "সিলেট (Sylhet)",
    "ময়মনসিংহ (Mymensingh)",
    "রংপুর (Rangpur)",
    "কুমিল্লা (Cumilla)",
    "ফরিদপুর (Faridpur)",
    "কক্সবাজার (Cox's Bazar)"
  ];

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
      toast.error(isBn ? 'দরপত্র আহ্বান করতে অনুগ্রহ করে সাইন ইন করুন।' : 'Please login to post an RFQ.');
      router.push('/auth/login?redirect=/rfq');
      onClose();
      return;
    }

    if (!formData.title.trim()) {
      toast.error(isBn ? 'কাঁচামালের নাম ও স্পেসিফিকেশন দিন।' : 'Please enter material name & specification.');
      return;
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error(isBn ? 'সঠিক পরিমাণ নির্ধারণ করুন।' : 'Please enter a valid quantity.');
      return;
    }

    if (!formData.contactPhone.trim()) {
      toast.error(isBn ? 'সরাসরি যোগাযোগের মোবাইল নম্বর আবশ্যক।' : 'Contact phone number is required.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(isBn ? 'দরপত্র সফলভাবে পোস্ট করা হয়েছে!' : 'RFQ posted successfully!');
        if (onSuccess) onSuccess(data.rfq);
        onClose();
        router.push('/rfq');
      } else {
        toast.error(data.message || (isBn ? 'দরপত্র পোস্ট ব্যর্থ হয়েছে।' : 'Failed to post RFQ.'));
      }
    } catch (error) {
      console.error('Submit RFQ error:', error);
      toast.error(isBn ? 'সার্ভারে সমস্যা হয়েছে।' : 'Server error submitting RFQ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-300">
                {isBn ? "বাল্ক কাঁচামাল রিকোয়ারমেন্ট" : "B2B Bulk Requirement"}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn ? "দরপত্র আহ্বান করুন (Post RFQ)" : "Post Material Requirement (RFQ)"}
              </h3>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-2">
            {isBn 
              ? "আপনার প্রয়োজনীয় কাঁচামালের বিবরণ লিখুন। যাচাইকৃত মিল ও স্টকিস্টরা সরাসরি সর্বনিম্ন দরপত্র জমা দেবে।"
              : "Describe your required raw material. Verified mills and suppliers will submit their lowest quotes directly."}
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Material Title */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              {isBn ? "কাঁচামালের নাম ও গ্রেড/ব্র্যান্ড" : "Raw Material Name, Grade & Brand"}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={isBn ? "যেমন: ৫০ টন বিএসআরএম ৬০-গ্রেড রড বা ভার্জিন পিপি প্লাস্টিক দানা..." : "e.g. 50 Ton BSRM 60-Grade Rebar or Virgin PP Granules..."}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 font-medium"
              required
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "ক্যাটাগরি" : "Category"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Quantity and Unit in one compact row */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "প্রয়োজনীয় পরিমাণ ও একক" : "Quantity & Unit"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  placeholder="৫০"
                  min="1"
                  className="w-2/3 px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 font-bold"
                  required
                />
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className="w-1/3 px-2.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 bg-white font-medium"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Location & Target Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "ডেলিভারি জেলা / জোন" : "Delivery District / Zone"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.deliveryDistrict}
                onChange={(e) => handleInputChange("deliveryDistrict", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 bg-white"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "প্রত্যাশিত দর (৳ প্রতি একক - ঐচ্ছিক)" : "Target Price (৳ per unit - Optional)"}
              </label>
              <input
                type="number"
                value={formData.targetPrice}
                onChange={(e) => handleInputChange("targetPrice", e.target.value)}
                placeholder={isBn ? "উন্মুক্ত দরপত্র হলে খালি রাখুন" : "Leave blank for open bid"}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Delivery Factory / Warehouse Address */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              {isBn ? "কারখানা বা গোডাউনের ঠিকানা (ঐচ্ছিক)" : "Factory / Warehouse Address (Optional)"}
            </label>
            <input
              type="text"
              value={formData.deliveryAddress}
              onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
              placeholder={isBn ? "যেমন: প্লট #২৪, বিসিক শিল্পনগরী, টঙ্গী..." : "e.g. Plot #24, BSCIC Industrial Area, Tongi..."}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900"
            />
          </div>

          {/* Contact Mobile & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "সরাসরি যোগাযোগের মোবাইল নম্বর" : "Direct Contact Mobile"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "কোম্পানি / মিলের নাম (ঐচ্ছিক)" : "Company / Mill Name (Optional)"}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.buyerCompany}
                  onChange={(e) => handleInputChange("buyerCompany", e.target.value)}
                  placeholder={isBn ? "যেমন: মেঘনা স্টিল মিলস" : "e.g. Meghna Steel Mills"}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Urgency & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "সরবরাহের সময়সীমা" : "Delivery Deadline"}
              </label>
              <select
                value={formData.deadlineDays}
                onChange={(e) => handleInputChange("deadlineDays", Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 bg-white"
              >
                <option value={3}>{isBn ? "জরুরি (৩ দিনের মধ্যে)" : "Urgent (Within 3 Days)"}</option>
                <option value={7}>{isBn ? "স্বাভাবিক (৭ দিনের মধ্যে)" : "Standard (Within 7 Days)"}</option>
                <option value={15}>{isBn ? "১৫ দিনের মধ্যে" : "Within 15 Days"}</option>
                <option value={30}>{isBn ? "চলতি মাসের মধ্যে" : "Within This Month"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                {isBn ? "জরুরিতা লেভেল" : "Urgency Priority"}
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange("urgency", e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900 bg-white"
              >
                <option value="standard">{isBn ? "স্বাভাবিক (Standard)" : "Standard"}</option>
                <option value="urgent">{isBn ? "🔴 অতীব জরুরি (Urgent Dispatch)" : "Urgent Dispatch"}</option>
                <option value="flexible">{isBn ? "দরদাম সাপেক্ষ (Flexible)" : "Flexible"}</option>
              </select>
            </div>
          </div>

          {/* Description & Technical Requirements */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              {isBn ? "বিশেষ কারিগরি শর্ত বা বিবরণ (ঐচ্ছিক)" : "Technical Specifications / Notes (Optional)"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={2}
              placeholder={isBn ? "যেমন: ল্যাব টেস্ট সার্টিফিকেট বা বুয়েট টেস্ট রিপোর্ট লাগবে, সরাসরি ট্রাক আনলোড সুবিধা ইত্যাদি..." : "e.g. Lab test certificate required, direct truck unloading facility available..."}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-900"
            />
          </div>

          {/* Notice Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
            <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p>
              {isBn 
                ? "দরপত্র পোস্ট করার সাথে সাথে আমাদের প্ল্যাটফর্মের নিবন্ধিত ও লাইসেন্সপ্রাপ্ত সাপ্লায়াররা নোটিফিকেশন পাবেন এবং আপনার দেওয়া নম্বরে যোগাযোগ করতে পারবেন।"
                : "Upon posting, verified suppliers across Bangladesh will be notified and can submit price bids or call your number directly."}
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isBn ? "পোস্ট হচ্ছে..." : "Posting..."}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{isBn ? "দরপত্র প্রকাশ করুন" : "Publish Material RFQ"}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
