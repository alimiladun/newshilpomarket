"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export default function AudioReaderButton({
  productName = "",
  price = "",
  unit = "",
  minOrder = "",
  supplierName = "",
  location = "",
  className = "",
  variant = "pill" // "pill" | "icon"
}) {
  const { isBn } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const speakProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error(isBn ? "আপনার ব্রাউজারে অডিও সমর্থিত নয়" : "Audio not supported in this browser");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any ongoing speech

    // Format natural spoken text in Bengali
    const cleanPrice = String(price).replace(/,/g, "");
    const spokenText = isBn
      ? `${productName}। দর প্রতি ${unit} ${cleanPrice} টাকা। ${
          minOrder ? `ন্যূনতম অর্ডার ${minOrder} ${unit}।` : ""
        } ${supplierName ? `সরবরাহকারী: ${supplierName}।` : ""} ${
          location ? `অবস্থান: ${location}।` : ""
        } সরাসরি কল বা হোয়াটসঅ্যাপে যোগাযোগ করুন।`
      : `${productName}. Price ${cleanPrice} Taka per ${unit}. ${
          minOrder ? `Minimum order ${minOrder} ${unit}.` : ""
        } ${supplierName ? `Supplier: ${supplierName}.` : ""} Contact via call or WhatsApp.`;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = isBn ? "bn-BD" : "en-US";
    utterance.rate = 0.95; // slightly slower for elderly clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlaying(true);
      toast.info(isBn ? "🔊 পণ্যের বিবরণ শোনানো হচ্ছে..." : "🔊 Playing audio description...", {
        duration: 3000
      });
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={speakProduct}
        className={`p-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 transition-all ${
          isPlaying ? "bg-blue-600 text-white border-blue-600 shadow-md animate-pulse" : ""
        } ${className}`}
        title={isPlaying ? "অডিও বন্ধ করুন" : "অডিওতে শুনুন (বাংলা ভয়েস)"}
        aria-label="Listen to Product Details"
      >
        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={speakProduct}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
        isPlaying
          ? "bg-blue-700 text-white border-blue-700 shadow-md animate-pulse"
          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      } ${className}`}
      title={isPlaying ? "অডিও থামান" : "বাংলায় অডিও শুনুন"}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-3.5 h-3.5 animate-spin" />
          <span>{isBn ? "থামান ⏹️" : "Stop"}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isBn ? "অডিওতে শুনুন 🔊" : "Listen 🔊"}</span>
        </>
      )}
    </button>
  );
}
