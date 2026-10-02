'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSearchbar from "./HeroSearchbar";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Package,
  Phone,
  ShieldCheck,
  Building2,
  TrendingUp,
  ArrowRight,
  Zap,
  Mic,
  CheckCircle2,
  MessageSquare,
  Sparkles
} from "lucide-react";

export default function Hero() {
  const { isBn } = useLanguage();

  const quickMaterials = [
    { name: isBn ? "রড ও স্টিল" : "Steel & Rods", icon: "🔩" },
    { name: isBn ? "স্ক্র্যাপ লোহা" : "Scrap Metal", icon: "⛓️" },
    { name: isBn ? "প্লাস্টিক দানা" : "Plastic Granules", icon: "🧪" },
    { name: isBn ? "তুলা ও সুতা" : "Cotton & Yarn", icon: "🧵" },
    { name: isBn ? "পাট ও বস্তা" : "Jute & Bags", icon: "🌾" },
    { name: isBn ? "সিমেন্ট" : "Cement", icon: "🏗️" },
    { name: isBn ? "কেমিক্যাল" : "Chemicals", icon: "⚗️" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/20 pt-28 pb-16 md:pt-32 md:pb-24">
      {/* Background Ambient Glow & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[350px] bg-indigo-50/50 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#1e40af 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Split Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Hero Content & Search */}
          <div className="lg:col-span-7 text-left">
            
            {/* Top Minimal Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50/90 border border-blue-200/80 shadow-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-900 mb-5 backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>{isBn ? "🇧🇩 বাংলাদেশের বিশ্বস্ত B2B কাঁচামাল বাজার" : "Bangladesh's Trusted B2B Raw Materials Market"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
              {isBn ? (
                <>
                  <span>সরাসরি মিল ও কারখানা থেকে</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
                    পাইকারি কাঁচামাল কেনা-বেচা
                  </span>
                </>
              ) : (
                <>
                  <span>Direct From Mills & Factories</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
                    Wholesale Raw Materials Trade
                  </span>
                </>
              )}
            </h1>

            {/* Honest, Clear Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal mb-7 max-w-2xl">
              {isBn
                ? "কোনো দালাল বা অতিরিক্ত কমিশন ছাড়া সরাসরি মিল মালিক ও সাপ্লায়ারদের সাথে ফোন বা হোয়াটসঅ্যাপে কথা বলে সেরা পাইকারি রেটে কাঁচামাল সংগ্রহ করুন।"
                : "Connect directly with mill owners and verified wholesale suppliers via direct phone calls or WhatsApp. True factory rates with zero broker fees."}
            </p>

            {/* Modern Search Bar with Voice Search */}
            <div className="mb-4">
              <HeroSearchbar />
            </div>

            {/* 1-Tap Popular Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-8">
              <span className="text-xs font-bold text-slate-400 mr-1">
                {isBn ? "জনপ্রিয় কাঁচামাল:" : "Popular:"}
              </span>
              {quickMaterials.map((mat) => (
                <Link
                  key={mat.name}
                  href={`/products?search=${encodeURIComponent(mat.name)}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-800 px-3 py-1.5 rounded-full shadow-xs transition-all hover:scale-105 active:scale-95"
                >
                  <span>{mat.icon}</span>
                  <span>{mat.name}</span>
                </Link>
              ))}
            </div>

            {/* Dual Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold rounded-xl shadow-md shadow-blue-900/15 text-sm sm:text-base transition-all hover:shadow-lg"
              >
                <Package className="w-5 h-5" />
                <span>{isBn ? "কাঁচামালের তালিকা দেখুন" : "Browse All Products"}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                href="/seller/dashboard/products/quick-add"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-200 hover:border-blue-400 font-bold rounded-xl shadow-xs text-sm sm:text-base transition-all"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{isBn ? "৩০ সেকেন্ডে পণ্য পোস্ট করুন" : "Quick Sell (30s)"}</span>
              </Link>
            </div>

            {/* Direct Helpline & WhatsApp Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-2">
              <a
                href="tel:+8801401658685"
                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isBn ? "হটলাইন: ০১৪০১-৬৫৮৬৮৫" : "Hotline: 01401-658685"}</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://wa.me/8801401658685"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? "সরাসরি হোয়াটসঅ্যাপ সহায়তা" : "Direct WhatsApp Support"}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Gorgeous Modern Materials Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Showcase Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-blue-900/10 bg-white group">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <Image
                    src="/hero-materials.jpg"
                    alt={isBn ? "শিল্পের কাঁচামাল - রড, সুতা, প্লাস্টিক দানা, পাট" : "Industrial Raw Materials Bangladesh"}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Subtle Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
                </div>

                {/* Overlaid Badge on Image (Top-Left) */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isBn ? "সরাসরি মিল ও ফ্যাক্টরি স্টক" : "Direct Factory Stock"}</span>
                </div>

                {/* Overlaid Badge on Image (Top-Right) */}
                <div className="absolute top-4 right-4 bg-blue-700/95 backdrop-blur-md shadow-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isBn ? "১০০% ভেরিফাইড" : "100% Verified"}</span>
                </div>

                {/* Overlaid Information Bar (Bottom of Image) */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <p className="text-xs font-medium text-slate-200 mb-1">
                    {isBn ? "শিল্পের প্রধান ৪টি কাঁচামাল:" : "Primary Raw Material Categories:"}
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                    <div className="bg-white/15 backdrop-blur-md rounded-lg py-1.5 border border-white/20">
                      🔩 {isBn ? "রড ও স্ক্র্যাপ" : "Steel"}
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-lg py-1.5 border border-white/20">
                      🧵 {isBn ? "তুলা ও সুতা" : "Yarn"}
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-lg py-1.5 border border-white/20">
                      🧪 {isBn ? "প্লাস্টিক দানা" : "Plastics"}
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-lg py-1.5 border border-white/20">
                      🌾 {isBn ? "পাট ও বস্তা" : "Jute"}
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Bottom Card: Live Trade / Instant Direct Contact Card */}
              <div className="mt-4 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-lg shadow-slate-200/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                    📞
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {isBn ? "সরাসরি ফোনে দরদাম করুন" : "Direct Phone Negotiation"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isBn ? "কোনো কমিশন বা মধ্যস্বত্বভোগী নেই" : "Zero commission or middleman fee"}
                    </p>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="shrink-0 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
                >
                  {isBn ? "পণ্য দেখুন →" : "View →"}
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            Bottom Trust Strip: 4 Authentic Value Pillars
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {isBn ? "সরাসরি কারখানা দর" : "Factory Direct Rates"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isBn ? "মিল মালিকদের আসল রেট" : "Authentic mill prices"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {isBn ? "১ ক্লিকে সরাসরি কল" : "1-Click Direct Call"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isBn ? "ফোন ও হোয়াটসঅ্যাপ চ্যাট" : "Instant phone & WhatsApp"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {isBn ? "যাচাইকৃত ব্যবসায়ী" : "Verified Businesses"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isBn ? "ট্রেড লাইসেন্স ও প্রোফাইল" : "Trade license & profile"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {isBn ? "বাংলা ভয়েস সার্চ" : "Bangla Voice Search"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {isBn ? "মুখে বলে কাঁচামাল খুঁজুন" : "Speak in Bangla to find"}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}