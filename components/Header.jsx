"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
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

  const categories = [
    {
      name: "Metals & Alloys",
      icon: "🔩",
      href: "/categories/metals-alloys",
      count: 1240,
      subcategories: [
        { name: "Steel & Iron", href: "/categories/metals-alloys/steel-iron", count: 420 },
        { name: "Aluminum", href: "/categories/metals-alloys/aluminum", count: 210 },
        { name: "Copper & Brass", href: "/categories/metals-alloys/copper-brass", count: 180 },
        { name: "Stainless Steel", href: "/categories/metals-alloys/stainless-steel", count: 160 },
        { name: "Titanium", href: "/categories/metals-alloys/titanium", count: 95 },
        { name: "Zinc & Lead", href: "/categories/metals-alloys/zinc-lead", count: 85 },
        { name: "Alloy Sheets & Bars", href: "/categories/metals-alloys/alloy-sheets", count: 90 },
      ],
    },
    {
      name: "Plastics & Polymers",
      icon: "🧪",
      href: "/categories/plastics-polymers",
      count: 870,
      subcategories: [
        { name: "PVC", href: "/categories/plastics-polymers/pvc", count: 210 },
        { name: "Polyethylene (PE)", href: "/categories/plastics-polymers/pe", count: 180 },
        { name: "Polypropylene (PP)", href: "/categories/plastics-polymers/pp", count: 155 },
        { name: "ABS Plastic", href: "/categories/plastics-polymers/abs", count: 120 },
        { name: "Nylon & Polyester", href: "/categories/plastics-polymers/nylon", count: 110 },
        { name: "Rubber & Elastomers", href: "/categories/plastics-polymers/rubber", count: 95 },
      ],
    },
    {
      name: "Textiles & Fibers",
      icon: "🧵",
      href: "/categories/textiles-fibers",
      count: 680,
      subcategories: [
        { name: "Cotton Yarn", href: "/categories/textiles-fibers/cotton-yarn", count: 150 },
        { name: "Synthetic Fabrics", href: "/categories/textiles-fibers/synthetic", count: 140 },
        { name: "Woven Fabrics", href: "/categories/textiles-fibers/woven", count: 120 },
        { name: "Non-woven Fabrics", href: "/categories/textiles-fibers/non-woven", count: 90 },
        { name: "Industrial Thread", href: "/categories/textiles-fibers/thread", count: 85 },
        { name: "Technical Textiles", href: "/categories/textiles-fibers/technical", count: 95 },
      ],
    },
    {
      name: "Chemicals & Materials",
      icon: "⚗️",
      href: "/categories/chemicals-materials",
      count: 940,
      subcategories: [
        { name: "Industrial Solvents", href: "/categories/chemicals-materials/solvents", count: 200 },
        { name: "Acids & Bases", href: "/categories/chemicals-materials/acids-bases", count: 180 },
        { name: "Adhesives & Resins", href: "/categories/chemicals-materials/adhesives", count: 160 },
        { name: "Dyes & Pigments", href: "/categories/chemicals-materials/dyes", count: 140 },
        { name: "Lubricants & Oils", href: "/categories/chemicals-materials/lubricants", count: 130 },
        { name: "Surfactants", href: "/categories/chemicals-materials/surfactants", count: 130 },
      ],
    },
    {
      name: "Electronics & Components",
      icon: "🔌",
      href: "/categories/electronics-components",
      count: 760,
      subcategories: [
        { name: "PCBs & Modules", href: "/categories/electronics-components/pcb", count: 180 },
        { name: "Connectors & Cables", href: "/categories/electronics-components/cables", count: 160 },
        { name: "Semiconductors", href: "/categories/electronics-components/semiconductors", count: 140 },
        { name: "Sensors", href: "/categories/electronics-components/sensors", count: 100 },
        { name: "Power Components", href: "/categories/electronics-components/power", count: 95 },
        { name: "Display Modules", href: "/categories/electronics-components/display", count: 85 },
      ],
    },
    {
      name: "Construction Materials",
      icon: "🏗️",
      href: "/categories/construction-materials",
      count: 1080,
      subcategories: [
        { name: "Cement & Concrete", href: "/categories/construction-materials/cement", count: 250 },
        { name: "Bricks & Blocks", href: "/categories/construction-materials/bricks", count: 200 },
        { name: "Sand & Aggregates", href: "/categories/construction-materials/aggregates", count: 180 },
        { name: "Iron Rods & Bars", href: "/categories/construction-materials/iron-rods", count: 170 },
        { name: "Tiles & Ceramics", href: "/categories/construction-materials/tiles", count: 140 },
        { name: "Pipes & Fittings", href: "/categories/construction-materials/pipes", count: 140 },
      ],
    },
    {
      name: "Food & Agriculture",
      icon: "🌾",
      href: "/categories/food-agriculture",
      count: 590,
      subcategories: [
        { name: "Grains & Cereals", href: "/categories/food-agriculture/grains", count: 140 },
        { name: "Spices & Herbs", href: "/categories/food-agriculture/spices", count: 120 },
        { name: "Edible Oils", href: "/categories/food-agriculture/oils", count: 100 },
        { name: "Fertilizers", href: "/categories/food-agriculture/fertilizers", count: 100 },
        { name: "Animal Feed", href: "/categories/food-agriculture/animal-feed", count: 90 },
        { name: "Agro Chemicals", href: "/categories/food-agriculture/agro-chemicals", count: 40 },
      ],
    },
    {
      name: "Energy & Fuels",
      icon: "⚡",
      href: "/categories/energy-fuels",
      count: 310,
      subcategories: [
        { name: "Industrial Fuel", href: "/categories/energy-fuels/industrial-fuel", count: 80 },
        { name: "Solar Components", href: "/categories/energy-fuels/solar", count: 70 },
        { name: "Batteries & Storage", href: "/categories/energy-fuels/batteries", count: 65 },
        { name: "Lubricants", href: "/categories/energy-fuels/lubricants", count: 55 },
        { name: "Gas & LPG", href: "/categories/energy-fuels/gas", count: 40 },
      ],
    },
    {
      name: "Paper & Packaging",
      icon: "📦",
      href: "/categories/paper-packaging",
      count: 430,
      subcategories: [
        { name: "Kraft Paper", href: "/categories/paper-packaging/kraft", count: 110 },
        { name: "Cardboard & Cartons", href: "/categories/paper-packaging/cardboard", count: 95 },
        { name: "Plastic Bags & Films", href: "/categories/paper-packaging/plastic-films", count: 90 },
        { name: "Labels & Stickers", href: "/categories/paper-packaging/labels", count: 70 },
        { name: "Foam & Bubble Wrap", href: "/categories/paper-packaging/foam", count: 65 },
      ],
    },
    {
      name: "Automotive Parts",
      icon: "🚗",
      href: "/categories/automotive-parts",
      count: 520,
      subcategories: [
        { name: "Engine Parts", href: "/categories/automotive-parts/engine", count: 130 },
        { name: "Brake Systems", href: "/categories/automotive-parts/brakes", count: 100 },
        { name: "Electrical Parts", href: "/categories/automotive-parts/electrical", count: 95 },
        { name: "Body & Frame Parts", href: "/categories/automotive-parts/body", count: 90 },
        { name: "Filters & Fluids", href: "/categories/automotive-parts/filters", count: 105 },
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
    { name: "Products", href: "/products" },
    { name: "Suppliers", href: "/sellers" },
    { name: "Insights", href: "/insights" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const handleNavClick = (e, item) => {
    e.preventDefault();
    // If it's the admin page, navigate directly
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
    // For regular routes, just navigate
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header */}
          <div className={`flex items-center justify-between py-2`}>
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="ShilpoMarket Logo"
                  className={`w-auto h-11 group-hover:scale-110 transition-all duration-300 ease-in-out`} // Fixed size
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="text-gray-800">
                <div className="text-2xl font-bold tracking-tight">
                  ShilpoMarket
                </div>
                <div className="text-xs text-gray-600 -mt-1">
                  Raw Materials Marketplace
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {/* Categories with Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleCategoriesMouseEnter}
                onMouseLeave={handleCategoriesMouseLeave}
              >
                <a
                  href="/categories"
                  onClick={(e) =>
                    handleNavClick(e, {
                      name: "Categories",
                      href: "/categories",
                    })
                  }
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  Categories
                  <svg
                    className={`ml-1 w-3 h-3 transition-transform duration-200 ${
                      isCategoriesOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </a>

                {/* Categories Dropdown — Two Panel */}
                {isCategoriesOpen && (
                  <div
                    className="absolute top-10 left-0 mt-2 w-[860px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex"
                    onMouseEnter={handleCategoriesMouseEnter}
                    onMouseLeave={handleCategoriesMouseLeave}
                  >
                    {/* Left Panel: Category List */}
                    <div className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => { setCategorySearch(e.target.value); setHoveredCategory(0); }}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      {/* Category list */}
                      <div className="overflow-y-auto flex-1 py-1">
                        {filteredCategories.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-6">No results</p>
                        ) : (
                          filteredCategories.map((cat, index) => (
                            <button
                              key={index}
                              onMouseEnter={() => setHoveredCategory(index)}
                              onClick={() => router.push(cat.href)}
                              className={`w-full flex items-center px-3 py-2.5 text-sm text-left transition-colors duration-150 ${
                                hoveredCategory === index
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <span className="text-base mr-2.5 leading-none">{cat.icon}</span>
                              <span className="flex-1 font-medium truncate">{cat.name}</span>
                              <span className="text-xs text-gray-400 mr-1">{cat.count.toLocaleString()}</span>
                              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))
                        )}
                      </div>
                      {/* View all link */}
                      <div className="p-3 border-t border-gray-200">
                        <a
                          href="/categories"
                          onClick={(e) => handleNavClick(e, { name: "Categories", href: "/categories" })}
                          className="block w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-1"
                        >
                          View All Categories →
                        </a>
                      </div>
                    </div>

                    {/* Right Panel: Subcategories */}
                    {filteredCategories[hoveredCategory] && (
                      <div className="flex-1 p-5 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-xl">{filteredCategories[hoveredCategory].icon}</span>
                            {filteredCategories[hoveredCategory].name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {filteredCategories[hoveredCategory].count.toLocaleString()} products
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {filteredCategories[hoveredCategory].subcategories.map((sub, si) => (
                            <button
                              key={si}
                              onClick={() => router.push(sub.href)}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 transition-all duration-150 text-left group"
                            >
                              <span className="font-medium">{sub.name}</span>
                              <span className="text-xs text-gray-400 group-hover:text-blue-500">{sub.count}</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <a
                            href={filteredCategories[hoveredCategory].href}
                            onClick={(e) => handleNavClick(e, { name: filteredCategories[hoveredCategory].name, href: filteredCategories[hoveredCategory].href })}
                            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Browse all in {filteredCategories[hoveredCategory].name}
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Desktop Auth Buttons or User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                {user ? (
                  <div className="relative group">
                    <button
                      className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl focus:outline-none"
                      tabIndex={0}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {getUserDisplayInfo().initial}
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-gray-800 dark:text-white text-base truncate max-w-[120px]">
                            {getUserDisplayInfo().name}
                          </span>
                          {getUserDisplayInfo().isVerified && (
                            <span
                              title="Verified User"
                              className="text-blue-500"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[120px]">
                          {getUserDisplayInfo().email}
                        </span>
                      </div>
                      <svg
                        className="ml-2 w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Dropdown menu */}
                    <div
                      className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all duration-200"
                      tabIndex={-1}
                    >
                      <button
                        className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-t-xl"
                        onClick={() =>
                          router.push(
                            user.company_name || user.companyName
                              ? "/seller/dashboard"
                              : "/buyer/dashboard"
                          )
                        }
                      >
                        Dashboard
                      </button>
                      <button
                        className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800"
                        onClick={() => router.push("/profile")}
                      >
                        Profile
                      </button>
                      <button
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-xl"
                        onClick={() => {
                          logout();
                          router.push("/");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="text-blue-700 shadow-lg hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                      onClick={() => router.push("/auth/login")}
                    >
                      Login
                    </button>
                    {/* <button
                      className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-800 transition-colors duration-200"
                      onClick={() => router.push("/auth/signup")}
                    >
                      Sign Up
                    </button> */}
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <div className="md:hidden mb-4">
                  <input
                    type="text"
                    placeholder="Search materials, suppliers..."
                    className="w-full px-4 py-2 bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
                  >
                    {item.name}
                  </a>
                ))}
                {/* Mobile Categories Accordion */}
                <div>
                  <button
                    onClick={() =>
                      setMobileExpandedCategory(
                        mobileExpandedCategory === "categories" || mobileExpandedCategory?.startsWith("cat-") ? null : "categories"
                      )
                    }
                    className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <span>Categories</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        mobileExpandedCategory === "categories" || mobileExpandedCategory?.startsWith("cat-") ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                mobileExpandedCategory === `cat-${ci}` ? "rotate-90" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
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
                                View all in {cat.name} →
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => { router.push("/categories"); setIsMobileMenuOpen(false); }}
                        className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-2 border-t border-gray-100 mt-1"
                      >
                        All Categories →
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col space-y-3">
                    {user ? (
                      <div className="relative group">
                        <button
                          className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl w-full focus:outline-none"
                          tabIndex={0}
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {getUserDisplayInfo().initial}
                          </div>
                          <div className="flex flex-col text-left">
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-gray-800 dark:text-white text-base truncate max-w-[120px]">
                                {getUserDisplayInfo().name}
                              </span>
                              {getUserDisplayInfo().isVerified && (
                                <span
                                  title="Verified User"
                                  className="text-blue-500"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[120px]">
                              {getUserDisplayInfo().email}
                            </span>
                          </div>
                          <svg
                            className="ml-2 w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {/* Dropdown menu */}
                        <div
                          className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all duration-200"
                          tabIndex={-1}
                        >
                          <button
                            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-t-xl"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              router.push(
                                user.company_name || user.companyName
                                  ? "/seller/dashboard"
                                  : "/buyer/dashboard"
                              );
                            }}
                          >
                            Dashboard
                          </button>
                          <button
                            className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              router.push("/profile");
                            }}
                          >
                            Profile
                          </button>
                          <button
                            className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-xl"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              logout();
                              router.push("/");
                            }}
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="w-full text-gray-700 hover:text-blue-600 transition-colors font-medium py-3 px-4 rounded-lg hover:bg-gray-50 border border-gray-300"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            router.push("/auth/login");
                          }}
                        >
                          Login
                        </button>
                        {/* <button
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 transition-colors duration-200"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            router.push("/auth/signup");
                          }}
                        >
                          Sign Up
                        </button> */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
