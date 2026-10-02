"use client";

import React from "react";
import {
  getWhatsAppUrl,
  getDirectCallUrl,
  MARKETPLACE_HOTLINE,
} from "../lib/communication";

export default function DirectContactButtons({
  phone,
  productName,
  price,
  unit,
  supplierName,
  variant = "card", // "card" | "full" | "inline"
  className = "",
}) {
  const targetPhone = phone || MARKETPLACE_HOTLINE;
  const callUrl = getDirectCallUrl(targetPhone);
  const waUrl = getWhatsAppUrl({
    phone: targetPhone,
    productName,
    price,
    unit,
    supplierName,
  });

  const handleStopPropagation = (e) => {
    e.stopPropagation();
  };

  if (variant === "full") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}
        onClick={handleStopPropagation}
      >
        {/* Direct Call Button */}
        <a
          href={callUrl}
          className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base border border-blue-600"
        >
          <span className="text-xl">📞</span>
          <span className="flex flex-col text-left leading-tight">
            <span>সরাসরি কল করুন</span>
            <span className="text-[11px] font-normal opacity-90">
              Direct Phone Call
            </span>
          </span>
        </a>

        {/* Instant WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa51] shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base border border-green-500"
        >
          <span className="text-xl">💬</span>
          <span className="flex flex-col text-left leading-tight">
            <span>হোয়াটসঅ্যাপে কথা বলুন</span>
            <span className="text-[11px] font-normal opacity-90">
              Instant WhatsApp
            </span>
          </span>
        </a>
      </div>
    );
  }

  // "card" variant for product grid items
  return (
    <div
      className={`grid grid-cols-2 gap-2 mt-2.5 ${className}`}
      onClick={handleStopPropagation}
    >
      {/* Call Button - Using original logo brand blue */}
      <a
        href={callUrl}
        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 shadow transition-all duration-150"
        title="সরাসরি কল করুন"
      >
        <span className="text-sm">📞</span>
        <span>কল করুন</span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-semibold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa51] shadow transition-all duration-150"
        title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
      >
        <span className="text-sm">💬</span>
        <span>হোয়াটসঅ্যাপ</span>
      </a>
    </div>
  );
}
