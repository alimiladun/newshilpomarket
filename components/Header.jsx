"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import NotificationDrawer from "./NotificationDrawer";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { t, isBn } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categoriesTimeout, setCategoriesTimeout] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);

  // Helper function to get user display info
  const getUserDisplayInfo = () => {
    if (!user)
      return { initial: "U", name: "User", email: "", isVerified: false };

    let initial = "U";
    let name = "User";
    let email = user.email || "";
    let isVerified = user.isVerified || user.is_verified || false;

    if (user.company_name || user.companyName) {
      const companyName = user.company_name || user.companyName;
      initial = companyName[0].toUpperCase();
      name = companyName;
    } else if (user.first_name || user.firstName) {
      const firstName = user.first_name || user.firstName;
      const lastName = user.last_name || user.lastName || "";
      initial = firstName[0].toUpperCase();
      name = `${firstName} ${lastName}`.trim();
    } else if (user.name) {
      initial = user.name[0].toUpperCase();
      name = user.name;
    }

    return { initial, name, email, isVerified };
  };

  const handleCategoriesMouseEnter = () => {
    if (categoriesTimeout) {
      clearTimeout(categoriesTimeout);
      setCategoriesTimeout(null);
    }
    setIsCategoriesOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCategoriesOpen(false);
    }, 300);
    setCategoriesTimeout(timeout);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsCategoriesOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const categories = [
    {
      name: isBn ? "ধাতু ও সংকর" : "Metals & Alloys",
      icon: "🔩",
      href: "/categories/metals-alloys",
      count: 1240,
      subcategories: [
        { name: isBn ? "স্টিল ও লোহা" : "Steel & Iron", href: "/categories/metals-alloys/steel-iron", count: 420 },
        { name: isBn ? "অ্যালুমিনিয়াম" : "Aluminum", href: "/categories/metals-alloys/aluminum", count: 210 },
        { name: isBn ? "কপার ও পিতল" : "Copper & Brass", href: "/categories/metals-alloys/copper-brass", count: 180 },
        { name: isBn ? "স্টেইনলেস স্টিল" : "Stainless Steel", href: "/categories/metals-alloys/stainless-steel", count: 160 },
        { name: isBn ? "টাইটেনিয়াম" : "Titanium", href: "/categories/metals-alloys/titanium", count: 95 },
        { name: isBn ? "জিঙ্ক ও সীসা" : "Zinc & Lead", href: "/categories/metals-alloys/zinc-lead", count: 85 },
        { name: isBn ? "অ্যালয় শিট ও বার" : "Alloy Sheets & Bars", href: "/categories/metals-alloys/alloy-sheets", count: 90 },
      ],
    },
    {
      name: isBn ? "প্লাস্টিক ও পলিমার" : "Plastics & Polymers",
      icon: "🧪",
      href: "/categories/plastics-polymers",
      count: 870,
      subcategories: [
        { name: "PVC", href: "/categories/plastics-polymers/pvc", count: 210 },
        { name: isBn ? "পলিইথিলিন (PE)" : "Polyethylene (PE)", href: "/categories/plastics-polymers/pe", count: 180 },
        { name: isBn ? "পলিপ্রোপিলিন (PP)" : "Polypropylene (PP)", href: "/categories/plastics-polymers/pp", count: 155 },
        { name: isBn ? "ABS প্লাস্টিক" : "ABS Plastic", href: "/categories/plastics-polymers/abs", count: 120 },
        { name: isBn ? "নাইলন ও পলিয়েস্টার" : "Nylon & Polyester", href: "/categories/plastics-polymers/nylon", count: 110 },
        { name: isBn ? "রাবার ও ইলাস্টোমার" : "Rubber & Elastomers", href: "/categories/plastics-polymers/rubber", count: 95 },
      ],
    },
    {
      name: isBn ? "টেক্সটাইল ও ফাইবার" : "Textiles & Fibers",
      icon: "🧵",
      href: "/categories/textiles-fibers",
      count: 680,
      subcategories: [
        { name: isBn ? "তুলা সুতা" : "Cotton Yarn", href: "/categories/textiles-fibers/cotton-yarn", count: 150 },
        { name: isBn ? "সিন্থেটিক কাপড়" : "Synthetic Fabrics", href: "/categories/textiles-fibers/synthetic", count: 140 },
        { name: isBn ? "বোনা কাপড়" : "Woven Fabrics", href: "/categories/textiles-fibers/woven", count: 120 },
        { name: isBn ? "নন-ওভেন কাপড়" : "Non-woven Fabrics", href: "/categories/textiles-fibers/non-woven", count: 90 },
        { name: isBn ? "শিল্প সুতা" : "Industrial Thread", href: "/categories/textiles-fibers/thread", count: 85 },
        { name: isBn ? "টেকনিক্যাল টেক্সটাইল" : "Technical Textiles", href: "/categories/textiles-fibers/technical", count: 95 },
      ],
    },
    {
      name: isBn ? "রাসায়নিক ও উপকরণ" : "Chemicals & Materials",
      icon: "⚗️",
      href: "/categories/chemicals-materials",
      count: 940,
      subcategories: [
        { name: isBn ? "শিল্প সলভেন্ট" : "Industrial Solvents", href: "/categories/chemicals-materials/solvents", count: 200 },
        { name: isBn ? "এসিড ও ক্ষার" : "Acids & Bases", href: "/categories/chemicals-materials/acids-bases", count: 180 },
        { name: isBn ? "আঠা ও রেজিন" : "Adhesives & Resins", href: "/categories/chemicals-materials/adhesives", count: 160 },
        { name: isBn ? "রঞ্জক ও রং" : "Dyes & Pigments", href: "/categories/chemicals-materials/dyes", count: 140 },
        { name: isBn ? "লুব্রিকেন্ট ও তেল" : "Lubricants & Oils", href: "/categories/chemicals-materials/lubricants", count: 130 },
        { name: "Surfactants", href: "/categories/chemicals-materials/surfactants", count: 130 },
      ],
    },
    {
      name: isBn ? "ইলেকট্রনিক্স ও যন্ত্রাংশ" : "Electronics & Components",
      icon: "🔌",
      href: "/categories/electronics-components",
      count: 760,
      subcategories: [
        { name: "PCBs & Modules", href: "/categories/electronics-components/pcb", count: 180 },
        { name: isBn ? "কানেক্টর ও তার" : "Connectors & Cables", href: "/categories/electronics-components/cables", count: 160 },
        { name: "Semiconductors", href: "/categories/electronics-components/semiconductors", count: 140 },
        { name: "Sensors", href: "/categories/electronics-components/sensors", count: 100 },
        { name: isBn ? "পাওয়ার কম্পোনেন্ট" : "Power Components", href: "/categories/electronics-components/power", count: 95 },
        { name: isBn ? "ডিসপ্লে মডিউল" : "Display Modules", href: "/categories/electronics-components/display", count: 85 },
      ],
    },
    {
      name: isBn ? "নির্মাণ সামগ্রী" : "Construction Materials",
      icon: "🏗️",
      href: "/categories/construction-materials",
      count: 1080,
      subcategories: [
        { name: isBn ? "সিমেন্ট ও কংক্রিট" : "Cement & Concrete", href: "/categories/construction-materials/cement", count: 250 },
        { name: isBn ? "ইট ও ব্লক" : "Bricks & Blocks", href: "/categories/construction-materials/bricks", count: 200 },
        { name: isBn ? "বালু ও পাথর" : "Sand & Aggregates", href: "/categories/construction-materials/aggregates", count: 180 },
        { name: isBn ? "লোহার রড" : "Iron Rods & Bars", href: "/categories/construction-materials/iron-rods", count: 170 },
        { name: isBn ? "টাইলস ও সিরামিক" : "Tiles & Ceramics", href: "/categories/construction-materials/tiles", count: 140 },
        { name: isBn ? "পাইপ ও ফিটিং" : "Pipes & Fittings", href: "/categories/construction-materials/pipes", count: 140 },
      ],
    },
    {
      name: isBn ? "খাদ্য ও কৃষি" : "Food & Agriculture",
      icon: "🌾",
      href: "/categories/food-agriculture",
      count: 590,
      subcategories: [
        { name: isBn ? "শস্য ও সিরিয়াল" : "Grains & Cereals", href: "/categories/food-agriculture/grains", count: 140 },
        { name: isBn ? "মশলা ও ভেষজ" : "Spices & Herbs", href: "/categories/food-agriculture/spices", count: 120 },
        { name: isBn ? "ভোজ্য তেল" : "Edible Oils", href: "/categories/food-agriculture/oils", count: 100 },
        { name: isBn ? "সার" : "Fertilizers", href: "/categories/food-agriculture/fertilizers", count: 100 },
        { name: isBn ? "পশু খাদ্য" : "Animal Feed", href: "/categories/food-agriculture/animal-feed", count: 90 },
        { name: isBn ? "কৃষি রাসায়নিক" : "Agro Chemicals", href: "/categories/food-agriculture/agro-chemicals", count: 40 },
      ],
    },
    {
      name: isBn ? "শক্তি ও জ্বালানি" : "Energy & Fuels",
      icon: "⚡",
      href: "/categories/energy-fuels",
      count: 310,
      subcategories: [
        { name: isBn ? "শিল্প জ্বালানি" : "Industrial Fuel", href: "/categories/energy-fuels/industrial-fuel", count: 80 },
        { name: isBn ? "সোলার যন্ত্রাংশ" : "Solar Components", href: "/categories/energy-fuels/solar", count: 70 },
        { name: isBn ? "ব্যাটারি ও স্টোরেজ" : "Batteries & Storage", href: "/categories/energy-fuels/batteries", count: 65 },
        { name: "Lubricants", href: "/categories/energy-fuels/lubricants", count: 55 },
        { name: isBn ? "গ্যাস ও LPG" : "Gas & LPG", href: "/categories/energy-fuels/gas", count: 40 },
      ],
    },
    {
      name: isBn ? "কাগজ ও প্যাকেজিং" : "Paper & Packaging",
      icon: "📦",
      href: "/categories/paper-packaging",
      count: 430,
      subcategories: [
        { name: isBn ? "ক্রাফট পেপার" : "Kraft Paper", href: "/categories/paper-packaging/kraft", count: 110 },
        { name: isBn ? "কার্টন ও বাক্স" : "Cardboard & Cartons", href: "/categories/paper-packaging/cardboard", count: 95 },
        { name: isBn ? "প্লাস্টিক ব্যাগ ও ফিল্ম" : "Plastic Bags & Films", href: "/categories/paper-packaging/plastic-films", count: 90 },
        { name: isBn ? "লেবেল ও স্টিকার" : "Labels & Stickers", href: "/categories/paper-packaging/labels", count: 70 },
        { name: isBn ? "ফোম ও বাবল র‍্যাপ" : "Foam & Bubble Wrap", href: "/categories/paper-packaging/foam", count: 65 },
      ],
    },
    {
      name: isBn ? "অটোমোটিভ যন্ত্রাংশ" : "Automotive Parts",
      icon: "🚗",
      href: "/categories/automotive-parts",
      count: 520,
      subcategories: [
        { name: isBn ? "ইঞ্জিন যন্ত্রাংশ" : "Engine Parts", href: "/categories/automotive-parts/engine", count: 130 },
        { name: isBn ? "ব্রেক সিস্টেম" : "Brake Systems", href: "/categories/automotive-parts/brakes", count: 100 },
        { name: isBn ? "ইলেকট্রিক্যাল পার্টস" : "Electrical Parts", href: "/categories/automotive-parts/electrical", count: 95 },
        { name: isBn ? "বডি ও ফ্রেম" : "Body & Frame Parts", href: "/categories/automotive-parts/body", count: 90 },
        { name: isBn ? "ফিল্টার ও তরল" : "Filters & Fluids", href: "/categories/automotive-parts/filters", count: 105 },
      ],
    },
  ];

  const filteredCategories = categorySearch.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
          c.subcategories.some((s) =>
            s.name.toLowerCase().includes(categorySearch.toLowerCase())
          )
      )
    : categories;

  const navItems = [
    { name: t("nav.products", "Products"), href: "/products" },
    { name: isBn ? "দরপত্র (RFQ)" : "Tenders (RFQ)", href: "/rfq", badge: isBn ? "নতুন" : "New" },
    { name: t("nav.suppliers", "Suppliers"), href: "/sellers" },
    { name: t("nav.insights", "Market Rates"), href: "/market-rates" },
    { name: t("nav.about", "About"), href: "/about" },
    { name: t("nav.contact", "Contact"), href: "/contact" },
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    if (item.href === "/admin") {
      router.push("/admin");
      return;
    }
    if (item.href.startsWith("#")) {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsMobileMenuOpen(false);
      return;
    }
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          {/* ── Main Header Row ── */}
          <div className="flex items-center justify-between h-16 gap-4">

            {/* ── LEFT: Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <img
                src="/logo.png"
                alt="ShilpoMarket Logo"
                className="h-9 w-auto group-hover:scale-105 transition-transform duration-300"
              />
              <div className="leading-tight">
                <div className="text-xl font-extrabold text-gray-900 tracking-tight whitespace-nowrap">
                  {isBn ? "শিল্পমার্কেট" : "ShilpoMarket"}
                </div>
                <div className="text-[10px] text-gray-500 font-medium whitespace-nowrap hidden sm:block">
                  {isBn ? "কাঁচামালের পাইকারি বাজার" : "Raw Materials Marketplace"}
                </div>
              </div>
            </Link>

            {/* ── CENTER: Navigation (desktop only) ── */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleCategoriesMouseEnter}
                onMouseLeave={handleCategoriesMouseLeave}
              >
                <button
                  onClick={() => router.push("/categories")}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 whitespace-nowrap"
                >
                  {t("nav.categories", "Categories")}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Categories Mega Dropdown */}
                {isCategoriesOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-[820px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex"
                    onMouseEnter={handleCategoriesMouseEnter}
                    onMouseLeave={handleCategoriesMouseLeave}
                  >
                    {/* Left Panel */}
                    <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
                      <div className="p-2.5 border-b border-gray-200">
                        <div className="relative">
                          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder={isBn ? "ক্যাটাগরি খুঁজুন..." : "Search categories..."}
                            value={categorySearch}
                            onChange={(e) => { setCategorySearch(e.target.value); setHoveredCategory(0); }}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 py-1">
                        {filteredCategories.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-6">No results</p>
                        ) : (
                          filteredCategories.map((cat, index) => (
                            <button
                              key={index}
                              onMouseEnter={() => setHoveredCategory(index)}
                              onClick={() => router.push(cat.href)}
                              className={`w-full flex items-center px-3 py-2 text-sm text-left transition-colors duration-100 ${
                                hoveredCategory === index
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <span className="text-base mr-2 leading-none flex-shrink-0">{cat.icon}</span>
                              <span className="flex-1 font-medium truncate text-xs">{cat.name}</span>
                              <span className="text-[10px] text-gray-400 mr-1">{cat.count.toLocaleString()}</span>
                              <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-2.5 border-t border-gray-200">
                        <button
                          onClick={() => router.push("/categories")}
                          className="block w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-1"
                        >
                          {isBn ? "সব ক্যাটাগরি দেখুন →" : "View All Categories →"}
                        </button>
                      </div>
                    </div>

                    {/* Right Panel */}
                    {filteredCategories[hoveredCategory] && (
                      <div className="flex-1 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <span className="text-lg">{filteredCategories[hoveredCategory].icon}</span>
                            {filteredCategories[hoveredCategory].name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {filteredCategories[hoveredCategory].count.toLocaleString()} {isBn ? "পণ্য" : "products"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {filteredCategories[hoveredCategory].subcategories.map((sub, si) => (
                            <button
                              key={si}
                              onClick={() => router.push(sub.href)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-xs text-gray-700 hover:text-blue-700 transition-all duration-100 text-left group"
                            >
                              <span className="font-medium">{sub.name}</span>
                              <span className="text-[10px] text-gray-400 group-hover:text-blue-500">{sub.count}</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => router.push(filteredCategories[hoveredCategory].href)}
                            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            {isBn ? `${filteredCategories[hoveredCategory].name}-এ সব দেখুন` : `Browse all in ${filteredCategories[hoveredCategory].name}`}
                            <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Regular nav items */}
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5 ${
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            {/* ── RIGHT: Actions ── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notification Drawer (Bell + Audio Chime + SMS Logs) */}
              {user && <NotificationDrawer />}

              {/* Language Switcher */}
              <LanguageToggle compact={true} />

              {/* Hotline — hidden on small screens, xl+ only */}
              <a
                href="tel:+8801401658685"
                className="hidden xl:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-full transition-all text-xs font-bold shadow-sm whitespace-nowrap"
                title={isBn ? "সরাসরি কথা বলুন" : "Call us directly"}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                <span>📞 {isBn ? "হটলাইন" : "Hotline"}: ০১৪০১-৬৫৮৬৮৫</span>
              </a>

              {/* Auth — desktop */}
              <div className="hidden sm:flex items-center">
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl focus:outline-none transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getUserDisplayInfo().initial}
                      </div>
                      <div className="flex flex-col text-left hidden xl:flex">
                        <span className="font-semibold text-gray-800 text-sm truncate max-w-[100px] leading-tight">
                          {getUserDisplayInfo().name}
                        </span>
                        {getUserDisplayInfo().isVerified && (
                          <span className="text-[10px] text-blue-600 font-semibold leading-tight">
                            ✓ {isBn ? "যাচাইকৃত" : "Verified"}
                          </span>
                        )}
                      </div>
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                      <button
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-t-xl transition-colors"
                        onClick={() => router.push(user.company_name || user.companyName ? "/seller/dashboard" : "/buyer/dashboard")}
                      >
                        {t("nav.dashboard", "Dashboard")}
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => router.push("/profile")}
                      >
                        {t("nav.settings", "Profile")}
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
                        onClick={() => { logout(); router.push("/"); }}
                      >
                        {t("nav.logout", "Logout")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap shadow-sm"
                    onClick={() => router.push("/auth/login")}
                  >
                    {t("nav.login", "লগইন")}
                  </button>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* Hotline + Language bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <LanguageToggle />
                <a
                  href="tel:+8801401658685"
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                >
                  📞 {t("common.callNow", "কল করুন")}
                </a>
              </div>

              {/* Search bar */}
              <input
                type="text"
                placeholder={t("common.searchPlaceholder", "কাঁচামাল খুঁজুন...")}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              {/* Nav items */}
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 font-semibold py-1.5 transition-colors"
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}

              {/* Categories accordion */}
              <div>
                <button
                  onClick={() =>
                    setMobileExpandedCategory(
                      mobileExpandedCategory === "categories" || mobileExpandedCategory?.startsWith("cat-") ? null : "categories"
                    )
                  }
                  className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 font-semibold py-1"
                >
                  <span>{t("nav.categories", "Categories")}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      mobileExpandedCategory === "categories" || mobileExpandedCategory?.startsWith("cat-") ? "rotate-180" : ""
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {(mobileExpandedCategory === "categories" || mobileExpandedCategory?.startsWith("cat-")) && (
                  <div className="mt-2 ml-1 space-y-0.5">
                    {categories.map((cat, ci) => (
                      <div key={ci}>
                        <button
                          onClick={() =>
                            setMobileExpandedCategory(
                              mobileExpandedCategory === `cat-${ci}` ? "categories" : `cat-${ci}`
                            )
                          }
                          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-xs text-gray-400">({cat.count.toLocaleString()})</span>
                          </span>
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileExpandedCategory === `cat-${ci}` ? "rotate-90" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {mobileExpandedCategory === `cat-${ci}` && (
                          <div className="ml-6 mt-1 mb-1 grid grid-cols-2 gap-1">
                            {cat.subcategories.map((sub, si) => (
                              <button
                                key={si}
                                onClick={() => { router.push(sub.href); setIsMobileMenuOpen(false); }}
                                className="text-left px-2 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                              >
                                {sub.name}
                              </button>
                            ))}
                            <button
                              onClick={() => { router.push(cat.href); setIsMobileMenuOpen(false); }}
                              className="col-span-2 text-left px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
                            >
                              {isBn ? `${cat.name}-এ সব দেখুন →` : `View all in ${cat.name} →`}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => { router.push("/categories"); setIsMobileMenuOpen(false); }}
                      className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 border-t border-gray-100 mt-1"
                    >
                      {isBn ? "সব ক্যাটাগরি →" : "All Categories →"}
                    </button>
                  </div>
                )}
              </div>

              {/* Auth section */}
              <div className="pt-3 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-2.5 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                        {getUserDisplayInfo().initial}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{getUserDisplayInfo().name}</div>
                        <div className="text-xs text-gray-500">{getUserDisplayInfo().email}</div>
                      </div>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      onClick={() => { setIsMobileMenuOpen(false); router.push(user.company_name || user.companyName ? "/seller/dashboard" : "/buyer/dashboard"); }}
                    >
                      {t("nav.dashboard", "Dashboard")}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                      onClick={() => { setIsMobileMenuOpen(false); router.push("/profile"); }}
                    >
                      {t("nav.settings", "Profile")}
                    </button>
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      onClick={() => { setIsMobileMenuOpen(false); logout(); router.push("/"); }}
                    >
                      {t("nav.logout", "Logout")}
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-base"
                    onClick={() => { setIsMobileMenuOpen(false); router.push("/auth/login"); }}
                  >
                    {t("nav.login", "লগইন করুন")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
