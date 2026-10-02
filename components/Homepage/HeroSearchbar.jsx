"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import VoiceSearchButton from "../VoiceSearchButton";
import { Search, ArrowRight } from "lucide-react";

export default function HeroSearchbar({ className = "" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { t, isBn } = useLanguage();

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleVoiceResult = (text) => {
    if (!text) return;
    setSearchTerm(text);
    // Automatically trigger search after brief delay
    setTimeout(() => {
      router.push(`/products?search=${encodeURIComponent(text.trim())}`);
    }, 400);
  };

  return (
    <div className={`w-full ${className}`}>
      <form
        onSubmit={handleSearch}
        className="relative flex items-center bg-white rounded-2xl p-1.5 sm:p-2 border-2 border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:border-blue-400 focus-within:border-blue-600 focus-within:shadow-[0_16px_50px_rgba(30,58,138,0.15)] transition-all duration-300"
      >
        {/* Left Search Icon */}
        <div className="pl-3 sm:pl-4 text-slate-400 shrink-0">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isBn
              ? "কাঁচামালের নাম লিখুন (যেমন: ৬০ গ্রেড রড, স্ক্র্যাপ, প্লাস্টিক, সুতা...)"
              : "Search raw materials (e.g. 60 Grade Steel Rods, Scrap, Plastic...)"
          }
          className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm sm:text-base font-semibold outline-none w-full"
        />

        {/* Voice Search Mic Button (Bangla Voice Engine) */}
        <VoiceSearchButton onResult={handleVoiceResult} />

        {/* Search Submit Button (Logo Brand Blue) */}
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm sm:text-base px-5 sm:px-7 py-3 rounded-xl shadow-md shadow-blue-900/20 flex items-center gap-1.5 transition-all duration-200 shrink-0"
        >
          <span>{isBn ? "খুঁজুন" : "Search"}</span>
          <ArrowRight className="w-4 h-4 hidden sm:inline-block" />
        </button>
      </form>
    </div>
  );
}