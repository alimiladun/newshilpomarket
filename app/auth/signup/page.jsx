"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import { API_ENDPOINTS } from "../../../lib/api";
import { useLanguage } from "../../../contexts/LanguageContext";
import { toast } from "sonner";

// Bangladesh districts (top 20 + others)
const BD_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "সিলেট", "খুলনা",
  "বরিশাল", "রংপুর", "ময়মনসিংহ", "নারায়ণগঞ্জ", "গাজীপুর",
  "কুমিল্লা", "টাঙ্গাইল", "ফরিদপুর", "যশোর", "বগুড়া",
  "নোয়াখালী", "দিনাজপুর", "পাবনা", "জামালপুর", "নরসিংদী",
  "অন্যান্য",
];

const RAW_MATERIAL_TYPES = [
  { bn: "লোহা / রড / স্টিল", en: "Iron / Rod / Steel", emoji: "🔩" },
  { bn: "স্ক্র্যাপ লোহা", en: "Scrap Metal", emoji: "⛓️" },
  { bn: "প্লাস্টিক দানা / PVC", en: "Plastic / PVC", emoji: "🧪" },
  { bn: "তুলা / সুতা", en: "Cotton / Yarn", emoji: "🧵" },
  { bn: "পাট ও পাটজাত পণ্য", en: "Jute", emoji: "🌾" },
  { bn: "সিমেন্ট / নির্মাণ সামগ্রী", en: "Cement / Building", emoji: "🏗️" },
  { bn: "রাসায়নিক", en: "Chemicals", emoji: "⚗️" },
  { bn: "অ্যালুমিনিয়াম / তামা", en: "Aluminium / Copper", emoji: "🥈" },
  { bn: "কাগজ ও প্যাকেজিং", en: "Paper / Packaging", emoji: "📦" },
  { bn: "অন্যান্য", en: "Other", emoji: "🏭" },
];

export default function SignupPage() {
  const router = useRouter();
  const { t, isBn } = useLanguage();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = Role, 2 = Details, 3 = Done
  const [accountType, setAccountType] = useState("buyer");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // Common
    name: "",
    phone: "",
    password: "",
    district: "",
    // Seller extra
    businessName: "",
    materialTypes: [],
    // Optional
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const set = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  const toggleMaterial = (item) => {
    setForm((prev) => ({
      ...prev,
      materialTypes: prev.materialTypes.includes(item)
        ? prev.materialTypes.filter((x) => x !== item)
        : [...prev.materialTypes, item],
    }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep2 = () => {
    if (!form.name.trim()) {
      toast.error(isBn ? "নাম দিন" : "Please enter your name");
      return false;
    }
    const ph = form.phone.replace(/\D/g, "");
    if (ph.length < 10) {
      toast.error(isBn ? "সঠিক মোবাইল নম্বর দিন" : "Enter a valid phone number");
      return false;
    }
    if (form.password.length < 6) {
      toast.error(isBn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" : "Password must be at least 6 characters");
      return false;
    }
    if (!form.district) {
      toast.error(isBn ? "জেলা বেছে নিন" : "Please select your district");
      return false;
    }
    if (accountType === "supplier" && !form.businessName.trim()) {
      toast.error(isBn ? "ব্যবসার নাম দিন" : "Please enter your business name");
      return false;
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);

    try {
      const apiUrl = accountType === "supplier"
        ? API_ENDPOINTS.SUPPLIER_SIGNUP()
        : API_ENDPOINTS.BUYER_SIGNUP();

      // Split name into first/last for the API
      const nameParts = form.name.trim().split(" ");
      const firstName = nameParts[0] || form.name;
      const lastName = nameParts.slice(1).join(" ") || "-";

      const payload = {
        firstName,
        lastName,
        phone: form.phone.replace(/\D/g, ""),
        password: form.password,
        confirmPassword: form.password,
        email: form.email || undefined,
        address: form.district,
        companyName: form.businessName || form.name,
        // Keep backward compatibility
        companyType: "sole_proprietorship",
        industry: form.materialTypes.join(", ") || "General Trading",
        interestedCategories: form.materialTypes,
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        if (result.data?.token) localStorage.setItem("token", result.data.token);
        if (result.data?.refreshToken) localStorage.setItem("refreshToken", result.data.refreshToken);
        const userData = result.data?.supplier || result.data?.buyer || result.data || {};
        localStorage.setItem("user", JSON.stringify({ ...userData, accountType }));
        setStep(3); // success screen
      } else {
        toast.error(result.message || (isBn ? "নিবন্ধন ব্যর্থ হয়েছে" : "Registration failed"));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <div className="flex items-start justify-center min-h-screen pt-20 pb-10 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-500" />

            <div className="p-7 sm:p-9">

              {/* ══════════════════ STEP 1: ROLE ══════════════════ */}
              {step === 1 && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-3xl">🛒</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                      {isBn ? "শিল্পমার্কেটে যোগ দিন" : "Join ShilpoMarket"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      {isBn ? "বিনামূল্যে অ্যাকাউন্ট খুলুন" : "Create your free account"}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-gray-600 mb-4 text-center">
                    {isBn ? "আপনি কী করতে চান?" : "What do you want to do?"}
                  </p>

                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <button
                      type="button"
                      onClick={() => { setAccountType("buyer"); setStep(2); }}
                      className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
                    >
                      <span className="text-4xl">🛒</span>
                      <div className="flex-1">
                        <div className="font-extrabold text-gray-900 text-base group-hover:text-blue-700">
                          {isBn ? "কাঁচামাল কিনবো" : "I want to Buy"}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {isBn ? "সরাসরি মিল ও সাপ্লায়ারের কাছ থেকে" : "Buy directly from verified suppliers"}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAccountType("supplier"); setStep(2); }}
                      className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 text-left group"
                    >
                      <span className="text-4xl">🏭</span>
                      <div className="flex-1">
                        <div className="font-extrabold text-gray-900 text-base group-hover:text-emerald-700">
                          {isBn ? "কাঁচামাল বিক্রি করবো" : "I want to Sell"}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {isBn ? "হাজার হাজার ক্রেতার কাছে পৌঁছান" : "Reach thousands of buyers — Free"}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-500">
                    {isBn ? "আগেই অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
                    <Link href="/auth/login" className="text-blue-600 font-extrabold hover:underline">
                      {isBn ? "লগইন করুন" : "Sign in"}
                    </Link>
                  </p>
                </>
              )}

              {/* ══════════════════ STEP 2: DETAILS FORM ══════════════════ */}
              {step === 2 && (
                <>
                  {/* Back + heading */}
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">
                        {accountType === "supplier"
                          ? (isBn ? "বিক্রেতা হিসেবে নিবন্ধন" : "Register as Seller")
                          : (isBn ? "ক্রেতা হিসেবে নিবন্ধন" : "Register as Buyer")}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isBn ? "মাত্র কয়েকটি তথ্য দিন" : "Just a few quick details"}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {isBn ? "আপনার নাম *" : "Your Name *"}
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder={isBn ? "যেমন: করিম মিয়া" : "e.g. Karim Mia"}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base"
                        autoFocus
                      />
                    </div>

                    {/* Business name (sellers only) */}
                    {accountType === "supplier" && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                          {isBn ? "ব্যবসার নাম / মিলের নাম *" : "Business / Mill Name *"}
                        </label>
                        <input
                          type="text"
                          value={form.businessName}
                          onChange={(e) => set("businessName", e.target.value)}
                          placeholder={isBn ? "যেমন: মেসার্স করিম ট্রেডার্স" : "e.g. Karim Traders"}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base"
                        />
                      </div>
                    )}

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {isBn ? "মোবাইল নম্বর *" : "Mobile Number *"}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm select-none">
                          🇧🇩 +880
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                          placeholder={isBn ? "০১৭XX-XXXXXX" : "01700-000000"}
                          className="w-full pl-20 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base"
                        />
                      </div>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {isBn ? "আপনার জেলা *" : "Your District *"}
                      </label>
                      <select
                        value={form.district}
                        onChange={(e) => set("district", e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base bg-white"
                      >
                        <option value="">{isBn ? "জেলা বেছে নিন" : "Select district"}</option>
                        {BD_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {isBn ? "পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)" : "Password * (min 6 chars)"}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => set("password", e.target.value)}
                          placeholder={isBn ? "গোপন পাসওয়ার্ড দিন" : "Create a password"}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Material types (sellers only) */}
                    {accountType === "supplier" && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {isBn ? "আপনি কী ধরনের কাঁচামাল বিক্রি করেন?" : "What materials do you sell?"}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {RAW_MATERIAL_TYPES.map((item) => {
                            const label = isBn ? item.bn : item.en;
                            const selected = form.materialTypes.includes(label);
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => toggleMaterial(label)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold text-left transition-all duration-150 ${
                                  selected
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <span className="text-base flex-shrink-0">{item.emoji}</span>
                                <span className="leading-tight">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Optional email */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        {isBn ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)"}
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base"
                      />
                    </div>

                    {/* Terms note */}
                    <p className="text-xs text-gray-400 text-center px-2">
                      {isBn
                        ? "নিবন্ধন করলে আপনি আমাদের ব্যবহারের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।"
                        : "By registering you agree to our Terms of Service and Privacy Policy."}
                    </p>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full font-extrabold py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] ${
                        accountType === "supplier"
                          ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 text-white disabled:bg-emerald-400"
                          : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 text-white disabled:bg-blue-400"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {isBn ? "নিবন্ধন হচ্ছে..." : "Registering..."}
                        </span>
                      ) : (
                        isBn ? "বিনামূল্যে নিবন্ধন করুন ✓" : "Register for Free ✓"
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-5">
                    {isBn ? "আগেই অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
                    <Link href="/auth/login" className="text-blue-600 font-extrabold hover:underline">
                      {isBn ? "লগইন করুন" : "Sign in"}
                    </Link>
                  </p>
                </>
              )}

              {/* ══════════════════ STEP 3: SUCCESS ══════════════════ */}
              {step === 3 && (
                <div className="text-center py-6">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                    {isBn ? "🎉 নিবন্ধন সফল!" : "🎉 Registration Successful!"}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    {isBn
                      ? `স্বাগতম, ${form.name}! আপনার শিল্পমার্কেট অ্যাকাউন্ট তৈরি হয়েছে।`
                      : `Welcome, ${form.name}! Your ShilpoMarket account is ready.`}
                  </p>
                  {accountType === "supplier" && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-left">
                      ⏳ {isBn
                        ? "আপনার বিক্রেতা অ্যাকাউন্টটি যাচাইয়ের জন্য পাঠানো হয়েছে। ২৪ ঘণ্টার মধ্যে অনুমোদন পাবেন।"
                        : "Your seller account is pending review. You'll be approved within 24 hours."}
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => router.push(accountType === "supplier" ? "/seller/dashboard" : "/buyer/dashboard")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl text-base transition-colors"
                    >
                      {isBn ? "ড্যাশবোর্ডে যান →" : "Go to Dashboard →"}
                    </button>
                    <button
                      onClick={() => router.push("/products")}
                      className="w-full border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-bold py-3.5 rounded-2xl text-base transition-colors"
                    >
                      {isBn ? "কাঁচামাল দেখুন" : "Browse Products"}
                    </button>
                  </div>

                  {/* WhatsApp welcome */}
                  <a
                    href={`https://wa.me/8801401658685?text=${encodeURIComponent(
                      isBn
                        ? `আমি ${form.name}, এইমাত্র শিল্পমার্কেটে নিবন্ধন করেছি। আমাকে গাইড করুন।`
                        : `Hi, I'm ${form.name} and just registered on ShilpoMarket. Please guide me.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl text-sm transition-all"
                  >
                    <span className="text-lg">💬</span>
                    {isBn ? "WhatsApp-এ সাহায্য নিন" : "Get help on WhatsApp"}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hotline */}
          <div className="mt-4 text-center">
            <a
              href="tel:+8801401658685"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isBn ? "সমস্যায় কল করুন: ০১৪০১-৬৫৮৬৮৫" : "Need help? Call: 01401-658685"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
