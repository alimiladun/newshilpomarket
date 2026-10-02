"use client";

import { useState, useEffect } from "react";
import {
  MARKETPLACE_HOTLINE,
  MARKETPLACE_HOTLINE_DISPLAY,
  getWhatsAppUrl,
  getDirectCallUrl,
} from "../lib/communication";

export default function WhatsAppWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer)
  }, []);

  const quickTopics = [
    { label: "কাঁচামাল কিনতে চাই (Buy Raw Materials)", msg: "আসসালামু আলাইকুম, আমি কাঁচামাল কিনতে চাই। বিস্তারিত জানতে চাই।" },
    { label: "মাল বিক্রি করতে চাই (Sell Materials)", msg: "আসসালামু আলাইকুম, আমি একজন সাপ্লায়ার/বিক্রেতা। পণ্য লিস্টিং করতে চাই।" },
    { label: "আজকের বাজার দর (Daily Price)", msg: "আসসালামু আলাইকুম, আজকের কাঁচামালের বাজার দর জানতে চাই।" },
    { label: "অর্ডার করতে সহায়তা প্রয়োজন (Order Help)", msg: "আসসালামু আলাইকুম, অর্ডার করার নিয়ম জানতে চাই। সরাসরি সহায়তা প্রয়োজন।" },
  ];

  const handleOpenWhatsApp = (customMessage) => {
    const url = getWhatsAppUrl({ customMessage });
    window.open(url, "_blank");
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Expanded Quick Action Popup */}
      {isExpanded && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-emerald-100 w-80 sm:w-96 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                  🤝
                </div>
                <div>
                  <div className="font-bold text-base leading-tight">
                    শিল্পমার্কেট হটলাইন সহায়তা
                  </div>
                  <div className="text-xs text-emerald-100 opacity-95">
                    সরাসরি কথা বলুন • Instant Support
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Buttons Body */}
          <div className="p-4 space-y-3 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-700">
              কোনো ফর্ম পূরণের প্রয়োজন নেই! সরাসরি যোগাযোগ করুন:
            </p>

            {/* Direct WhatsApp Call-to-action */}
            <button
              type="button"
              onClick={() => handleOpenWhatsApp()}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="text-sm font-extrabold">হোয়াটসঅ্যাপে সরাসরি কথা বলুন</div>
                <div className="text-[11px] font-normal opacity-90">১ ক্লিকে চ্যাট শুরু করুন (Chat on WhatsApp)</div>
              </div>
            </button>

            {/* Direct Phone Call */}
            <a
              href={getDirectCallUrl(MARKETPLACE_HOTLINE)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all transform active:scale-95 text-center"
            >
              <span className="text-2xl">📞</span>
              <div className="text-left">
                <div className="text-sm font-extrabold">সরাসরি কল দিন: {MARKETPLACE_HOTLINE_DISPLAY}</div>
                <div className="text-[11px] font-normal opacity-90">টোল-ফ্রি ও দ্রুত সংযোগ (Direct Phone Call)</div>
              </div>
            </a>

            {/* Quick topics */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                দ্রুত বার্তা পাঠান (Quick Topics):
              </span>
              <div className="space-y-1.5">
                {quickTopics.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOpenWhatsApp(topic.msg)}
                    className="w-full text-left text-xs bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 p-2.5 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <span>{topic.label}</span>
                    <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white focus:outline-none"
        aria-label="Contact ShilpoMarket Support"
      >
        <span className="text-2xl animate-bounce">💬</span>
        <div className="hidden sm:flex flex-col text-left pr-1">
          <span className="text-xs font-black tracking-tight leading-tight">
            সরাসরি যোগাযোগ
          </span>
          <span className="text-[10px] opacity-90 font-medium leading-none">
            কল / হোয়াটসঅ্যাপ
          </span>
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
        </span>
      </button>
    </div>
  );
}
