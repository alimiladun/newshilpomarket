"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import { useAuth } from "../../../contexts/AuthContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { toast } from "sonner";

// Bangladesh districts for phone prefix
const BD_PHONE_PREFIX = "+880";

export default function LoginPage() {
  const { t, isBn } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();

  const [accountType, setAccountType] = useState("supplier");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePhone, setUsePhone] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const identifier = usePhone ? phone.trim() : email.trim();
    if (!identifier || !password) {
      toast.error(isBn ? "মোবাইল নম্বর ও পাসওয়ার্ড দিন" : "Please enter your credentials");
      return;
    }

    setIsLoading(true);
    try {
      // Build credentials — backend accepts both email and phone
      const credentials = usePhone
        ? { phone: identifier, password }
        : { email: identifier, password };

      const result = await login(credentials, accountType);
      if (result.success) {
        toast.success(isBn ? "লগইন সফল হয়েছে!" : "Login successful!");
        setTimeout(() => {
          router.push(accountType === "supplier" ? "/seller/dashboard" : "/buyer/dashboard");
        }, 200);
      } else {
        toast.error(result.message || (isBn ? "লগইন ব্যর্থ হয়েছে" : "Login failed"));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500" />

            <div className="p-7 sm:p-9">
              {/* Logo & title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🏭</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  {isBn ? "আবার স্বাগতম" : "Welcome Back"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {isBn ? "শিল্পমার্কেটে লগইন করুন" : "Sign in to ShilpoMarket"}
                </p>
              </div>

              {/* ── STEP 1: Role selection ── */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 text-center">
                  {isBn ? "আপনি কে?" : "I am a"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { role: "buyer", emoji: "🛒", bn: "আমি কিনবো", en: "Buyer" },
                    { role: "supplier", emoji: "🏭", bn: "আমি বিক্রি করবো", en: "Seller" },
                  ].map(({ role, emoji, bn, en }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setAccountType(role)}
                      className={`relative flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                        accountType === role
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]"
                          : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      {accountType === role && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                      <span className="text-3xl">{emoji}</span>
                      <span>{isBn ? bn : en}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── STEP 2: Phone or Email toggle ── */}
              <div className="mb-4">
                <div className="flex rounded-xl bg-gray-100 p-1 gap-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setUsePhone(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      usePhone ? "bg-white shadow text-blue-700" : "text-gray-500"
                    }`}
                  >
                    📱 {isBn ? "মোবাইল নম্বর" : "Mobile Number"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsePhone(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      !usePhone ? "bg-white shadow text-blue-700" : "text-gray-500"
                    }`}
                  >
                    ✉️ {isBn ? "ইমেইল" : "Email"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone or Email field */}
                {usePhone ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      {isBn ? "মোবাইল নম্বর" : "Mobile Number"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm select-none">
                        🇧🇩 +880
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setPhone(val);
                        }}
                        placeholder={isBn ? "০১৭XX-XXXXXX" : "01700-000000"}
                        className="w-full pl-20 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base font-medium placeholder-gray-400"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      {isBn ? "ইমেইল ঠিকানা" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base"
                      autoComplete="email"
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-gray-700">
                      {isBn ? "পাসওয়ার্ড" : "Password"}
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isBn ? "আপনার পাসওয়ার্ড" : "Your password"}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 text-base pr-12"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-4 rounded-2xl text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {isBn ? "লগইন হচ্ছে..." : "Signing in..."}
                    </span>
                  ) : (
                    isBn ? "লগইন করুন →" : "Sign In →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold">
                  {isBn ? "অথবা সরাসরি যোগাযোগ করুন" : "OR"}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Direct WhatsApp support */}
              <a
                href="https://wa.me/8801401658685?text=আমার%20লগইনে%20সমস্যা%20হচ্ছে%2C%20সাহায্য%20করুন"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl text-sm transition-all"
              >
                <span className="text-xl">💬</span>
                {isBn ? "WhatsApp-এ সাহায্য নিন" : "Get help on WhatsApp"}
              </a>

              {/* Sign up link */}
              <p className="text-center text-sm text-gray-500 mt-6">
                {isBn ? "অ্যাকাউন্ট নেই?" : "New to ShilpoMarket?"}{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-extrabold"
                >
                  {isBn ? "বিনামূল্যে নিবন্ধন করুন" : "Register for free"}
                </Link>
              </p>
            </div>
          </div>

          {/* Hotline strip */}
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
