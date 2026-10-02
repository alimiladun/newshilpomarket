"use client";

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageToggle({ className = "", compact = false }) {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <div className={`inline-flex items-center rounded-full bg-slate-100 p-0.5 border border-slate-200 shadow-inner ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage("bn")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-150 ${
            language === "bn"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="বাংলায় পরিবর্তন করুন"
        >
          <span>🇧🇩</span>
          <span>বাংলা</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-150 ${
            language === "en"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="Switch to English"
        >
          <span>🇬🇧</span>
          <span>ENG</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/90 shadow-inner ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${
          language === "bn"
            ? "bg-emerald-600 text-white shadow"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
        }`}
      >
        <span className="text-sm">🇧🇩</span>
        <span>বাংলা</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200 ${
          language === "en"
            ? "bg-emerald-600 text-white shadow"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
        }`}
      >
        <span className="text-sm">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
}
