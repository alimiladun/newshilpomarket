"use client";

import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import { MARKETPLACE_HOTLINE, MARKETPLACE_HOTLINE_DISPLAY, getDirectCallUrl, getWhatsAppUrl } from "../lib/communication";
import LanguageToggle from "./LanguageToggle";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, isBn, toBanglaNumber } = useLanguage();

  const footerSections = [
    {
      title: isBn ? "কাঁচামাল সমূহ" : "Raw Materials",
      links: [
        { name: isBn ? "লোহা ও স্টিল" : "Metals & Alloys", href: "/categories/metals-alloys" },
        { name: isBn ? "প্লাস্টিক ও পলিমার" : "Plastics & Polymers", href: "/categories/plastics-polymers" },
        { name: isBn ? "তুলা, সুতা ও পাট" : "Textiles & Fibers", href: "/categories/textiles-fibers" },
        { name: isBn ? "কেমিক্যাল সামগ্রী" : "Chemicals & Materials", href: "/categories/chemicals-materials" },
        { name: isBn ? "রড ও সিমেন্ট" : "Construction Materials", href: "/categories/construction-building" },
      ],
    },
    {
      title: isBn ? "ব্যবসায়ীদের জন্য" : "For Traders",
      links: [
        { name: isBn ? "সকল কাঁচামাল ব্রাউজ" : "Browse All Products", href: "/products" },
        { name: isBn ? "সাপ্লায়ার ডিরেক্টরি" : "Find Suppliers", href: "/sellers" },
        { name: isBn ? "মাল বিক্রি করুন (ফ্রি)" : "Become a Supplier", href: "/auth/signup" },
        { name: isBn ? "দৈনিক বাজার দর" : "Market Insights", href: "/insights" },
        { name: isBn ? "নিরাপদ লেনদেন নীতি" : "Safe Trade Escrow", href: "/about" },
      ],
    },
    {
      title: isBn ? "সহায়তা ও যোগাযোগ" : "Help & Contact",
      links: [
        { name: isBn ? "আমাদের সম্পর্কে" : "About Us", href: "/about" },
        { name: isBn ? "যোগাযোগ ও ঠিকানা" : "Contact Office", href: "/contact" },
        { name: isBn ? "হোয়াটসঅ্যাপে সহায়তা" : "WhatsApp Support", href: getWhatsAppUrl({ customMessage: "আসসালামু আলাইকুম, শিল্পমার্কেট সম্পর্কে সরাসরি জানতে চাই।" }) },
        { name: isBn ? "ব্যবহারের নিয়মাবলী" : "Terms of Service", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="ShilpoMarket Logo"
                className="w-auto h-10 transition-transform group-hover:scale-105"
              />
              <div>
                <span className="text-2xl font-black text-white">
                  {isBn ? "শিল্পমার্কেট" : "ShilpoMarket"}
                </span>
                <div className="text-xs text-emerald-400 font-semibold">
                  {isBn ? "বাংলাদেশের ১ নম্বর কাঁচামালের বাজার" : "B2B Raw Materials Marketplace"}
                </div>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {t("footer.aboutText", "শিল্পমার্কেট হলো বাংলাদেশের বৃহত্তম কাঁচামাল কেনা-বেচার উন্মুক্ত প্ল্যাটফর্ম। মিল মালিক, আমদানিকারক ও পাইকারি ব্যবসায়ীদের বিশ্বস্ত ডিজিটাল ঠিকানা।")}
            </p>

            {/* Direct Helpline Badge in Footer */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl max-w-md space-y-2">
              <div className="text-xs font-bold text-slate-300">
                {isBn ? "📞 সরাসরি ফোন বা হোয়াটসঅ্যাপে কথা বলুন:" : "📞 Direct Phone or WhatsApp Support:"}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={getDirectCallUrl(MARKETPLACE_HOTLINE)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>📞</span>
                  <span>{MARKETPLACE_HOTLINE_DISPLAY}</span>
                </a>
                <a
                  href={getWhatsAppUrl({ customMessage: "আসসালামু আলাইকুম, শিল্পমার্কেট সম্পর্কে সরাসরি জানতে চাই।" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <span>💬</span>
                  <span>{isBn ? "হোয়াটসঅ্যাপে চ্যাট" : "WhatsApp Chat"}</span>
                </a>
              </div>
            </div>

            {/* Language Switcher in Footer */}
            <div className="pt-1">
              <span className="text-xs text-slate-500 block mb-1 font-medium">
                {isBn ? "ভাষা নির্বাচন করুন (Language):" : "Select Language:"}
              </span>
              <LanguageToggle compact={false} />
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-base font-bold text-white tracking-wide border-b border-slate-800 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white text-xs sm:text-sm transition-colors hover:translate-x-1 inline-block duration-150"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <div>
              {isBn
                ? `© ২০২৫ শিল্পমার্কেট (ShilpoMarket) - সর্বস্বত্ব সংরক্ষিত।`
                : `© 2025 ShilpoMarket - All rights reserved.`}
            </div>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-white transition-colors">
                {isBn ? "আমাদের সম্পর্কে" : "About Us"}
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                {isBn ? "যোগাযোগ" : "Contact"}
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Dhaka, Bangladesh 🇧🇩</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
