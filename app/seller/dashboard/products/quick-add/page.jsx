"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../../../components/Header";
import { useAuth } from "../../../../../contexts/AuthContext";
import { useLanguage } from "../../../../../contexts/LanguageContext";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  Package,
  Layers,
  HelpCircle,
  Eye,
  Plus
} from "lucide-react";

// Raw material categories tailored for Bangladesh wholesale trade
const CATEGORIES = [
  { id: 1, bn: "লোহা / রড / স্টিল", en: "Steel & Rods", emoji: "🔩", category: "Metals & Alloys", samples: ["বিএসআরএম ৬০ গ্রেড রড", "কেএসআরএম এমএস রড", "অ্যাঙ্গেল ও চ্যানেল বার"] },
  { id: 2, bn: "স্ক্র্যাপ লোহা", en: "Scrap Metal", emoji: "⛓️", category: "Metals & Alloys", samples: ["এইচএমএস ১ স্ক্র্যাপ", "জাহাজ ভাঙা প্লেট স্ক্র্যাপ", "সিআরসি শিট স্ক্র্যাপ"] },
  { id: 3, bn: "প্লাস্টিক দানা / PVC", en: "Plastic & PVC", emoji: "🧪", category: "Plastics & Polymers", samples: ["পিপি ভার্জিন দানা", "এইচডিপিই ব্ল্যাক দানা", "পিভিসি রেজিন"] },
  { id: 4, bn: "তুলা ও সুতা", en: "Cotton & Yarn", emoji: "🧵", category: "Textiles", samples: ["১০০% সুতি সুতা ৩০ কাউন্ট", "পলিয়েস্টার সুতা", "কাঁচা তুলা বেল"] },
  { id: 5, bn: "পাট ও পাটজাত পণ্য", en: "Jute Raw & Bags", emoji: "🌾", category: "Textiles", samples: ["তোষা কাঁচা পাট", "মেসতা পাট", "বি-টুইল পাটের বস্তা"] },
  { id: 6, bn: "সিমেন্ট ও নির্মাণ", en: "Cement & Building", emoji: "🏗️", category: "Construction Materials", samples: ["শাহ সিমেন্ট ও সাধারণ পোর্টল্যান্ড", "ফ্রেশ সিমেন্ট", "পাথর ও লাল বালু"] },
  { id: 7, bn: "শিল্প রাসায়নিক", en: "Industrial Chemicals", emoji: "⚗️", category: "Chemicals", samples: ["কস্টিক সোডা ফ্লেক্স", "হাইড্রোজেন পারক্সাইড ৫০%", "সালফিউরিক অ্যাসিড"] },
  { id: 8, bn: "অ্যালুমিনিয়াম ও তামা", en: "Aluminium & Copper", emoji: "🥈", category: "Metals & Alloys", samples: ["অ্যালুমিনিয়াম ইনগট", "তামার তার স্ক্র্যাপ / কপার ক্যাবল", "পিতল / ব্রাস রড"] },
  { id: 9, bn: "কাগজ ও প্যাকেজিং", en: "Paper & Packaging", emoji: "📦", category: "Packaging", samples: ["ক্রাফট পেপার রিল", "কার্টন ও ঢেউখেলানো শিট", "পিপি বোনা বস্তা"] },
  { id: 10, bn: "অন্যান্য কাঁচামাল", en: "Other Materials", emoji: "🏭", category: "Other", samples: ["কৃষি কাঁচামাল", "রাবার সামগ্রী", "কয়লা ও জ্বালানি"] }
];

// Local wholesale units in Bangladesh
const LOCAL_UNITS = [
  { id: "tons", bn: "টন (Ton)", en: "Ton", desc: "১০০০ কেজি" },
  { id: "mon", bn: "মণ (Mon)", en: "Mon", desc: "৪০ কেজি" },
  { id: "kg", bn: "কেজি (Kg)", en: "Kg", desc: "কিলোগ্রাম" },
  { id: "bag", bn: "বস্তা (Bag)", en: "Bag", desc: "৫০ কেজি / সাধারণ বস্তা" },
  { id: "pieces", bn: "পিস / টি (Pcs)", en: "Pieces", desc: "একক সংখ্যা" },
  { id: "cft", bn: "সিএফটি (CFT)", en: "CFT", desc: "ঘনফুট (বালু / পাথর)" }
];

export default function QuickAddProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isBn } = useLanguage();

  // Form State
  const [step, setStep] = useState(1); // 1 = Photo, 2 = Info & Category, 3 = Price & Stock, 4 = Success
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  // Form Data
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [productName, setProductName] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("tons");
  const [price, setPrice] = useState("");
  const [minOrder, setMinOrder] = useState("1");
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("100");
  const [location, setLocation] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");

  // Photo State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Redirect if not supplier
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login?redirect=/seller/dashboard/products/quick-add");
      return;
    }
    if (user.accountType !== "supplier") {
      toast.error(isBn ? "শুধুমাত্র বিক্রেতারা পণ্য যোগ করতে পারেন" : "Only suppliers can add products");
      router.push("/buyer/dashboard");
      return;
    }
    if (user.phone) setSellerPhone(user.phone);
    if (user.address) setLocation(user.address);
  }, [user, authLoading]);

  // Handle local file selection with client-side compression
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(isBn ? "অনুগ্রহ করে একটি ছবি নির্বাচন করুন" : "Please select an image file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
    toast.success(isBn ? "ছবি যুক্ত হয়েছে!" : "Photo selected!");
  };

  // Upload to Cloudinary helper
  const uploadImageToCloudinary = async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to upload image");
    }

    return data.data?.url;
  };

  // Step 1 Validation
  const handleNextFromStep1 = () => {
    setStep(2);
  };

  // Step 2 Validation
  const handleNextFromStep2 = () => {
    if (!productName.trim()) {
      toast.error(isBn ? "কাঁচামালের নাম লিখুন বা নিচের নামগুলো থেকে বেছে নিন" : "Please enter product name");
      return;
    }
    setStep(3);
  };

  // Step 3 Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!price || parseFloat(price) <= 0) {
      toast.error(isBn ? "সঠিক বিক্রয়মূল্য দিন" : "Please enter a valid price");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      let uploadedUrl = null;

      // 1. Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          uploadedUrl = await uploadImageToCloudinary(imageFile);
        } catch (imgErr) {
          console.warn("Cloudinary upload failed, continuing with fallback:", imgErr);
        } finally {
          setUploadingImage(false);
        }
      }

      // Default high quality raw material photo based on category if no image uploaded
      const fallbackImageMap = {
        1: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80", // Steel
        2: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80", // Scrap
        3: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80", // Plastic
        4: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80", // Textile
        5: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80", // Jute
        6: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80", // Cement
        7: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80", // Chemical
        8: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80", // Aluminium
        9: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80", // Paper
        10: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80" // Other
      };

      const finalImageUrl = uploadedUrl || imagePreview || fallbackImageMap[selectedCategory.id] || fallbackImageMap[10];

      // 2. Prepare payload
      const payload = {
        name: productName.trim(),
        category: selectedCategory.bn,
        categoryId: selectedCategory.id,
        price: parseFloat(price),
        unit: selectedUnit,
        minOrder: parseInt(minOrder) || 1,
        inStock: inStock,
        stockQuantity: parseInt(stockQuantity) || 100,
        images: [{ url: finalImageUrl, resourceType: "image" }],
        primaryImage: finalImageUrl,
        location: location || user?.address || "বাংলাদেশ",
        description: `${productName} - ${selectedCategory.bn}। সরাসরি পাইকারি সরবরাহকারী: ${user?.companyName || user?.firstName}। ফোন: ${sellerPhone || user?.phone}।`,
        tags: [selectedCategory.bn, selectedCategory.en, selectedUnit]
      };

      // 3. Post to API
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCreatedProduct(data.product);
        setStep(4); // Success screen
        toast.success(isBn ? "🎉 পণ্য সফলভাবে পোস্ট হয়েছে!" : "Product published successfully!");
      } else {
        toast.error(data.message || (isBn ? "পণ্য পোস্ট ব্যর্থ হয়েছে" : "Failed to publish product"));
      }
    } catch (err) {
      console.error("Error creating quick product:", err);
      toast.error(err.message || (isBn ? "সার্ভার সমস্যা হয়েছে" : "Server error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-2xl mx-auto pt-24 pb-16 px-4">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-20 text-9xl">🏭</div>
          <div className="flex items-center justify-between relative z-10 mb-3">
            <Link
              href="/seller/dashboard/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? "আমার পণ্যসমূহ" : "My Products"}
            </Link>
            <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-400/30 text-emerald-100 px-3 py-1 rounded-full border border-emerald-300/30">
              ⚡ {isBn ? "৩০ সেকেন্ডে বিক্রয়" : "Quick Sell in 30s"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black relative z-10">
            {isBn ? "সহজে নতুন পণ্য আপলোড করুন" : "Sell Your Raw Materials Fast"}
          </h1>
          <p className="text-emerald-100 text-sm mt-1 relative z-10">
            {isBn
              ? "মাত্র ৩টি ধাপে সহজে কাঁচামালের ছবি, দরদাম দিন আর হাজারো ক্রেতা পান!"
              : "Just 3 simple steps: Add photo, set price, and connect with buyers."}
          </p>

          {/* Stepper Progress Bar */}
          {step < 4 && (
            <div className="grid grid-cols-3 gap-2 mt-6 relative z-10">
              {[
                { s: 1, label: isBn ? "১. ছবি" : "1. Photo", icon: "📸" },
                { s: 2, label: isBn ? "২. ধরণ" : "2. Details", icon: "🏷️" },
                { s: 3, label: isBn ? "৩. দরদাম" : "3. Price", icon: "💰" }
              ].map(({ s, label, icon }) => (
                <div
                  key={s}
                  onClick={() => { if (s < step) setStep(s); }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    step === s
                      ? "bg-white text-emerald-800 shadow-md scale-[1.02]"
                      : step > s
                      ? "bg-emerald-500/50 text-white"
                      : "bg-black/15 text-emerald-200"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {step > s && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 ml-1" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STEP 1: PHOTO (ছবি তুলুন বা দিন)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="text-center mb-6">
              <span className="inline-block p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-2 text-2xl">
                📸
              </span>
              <h2 className="text-xl font-black text-slate-800">
                {isBn ? "কাঁচামালের ছবি তুলুন বা নির্বাচন করুন" : "Upload Product Photo"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isBn
                  ? "ভালো স্পষ্ট ছবি দিলে ক্রেতারা বেশি যোগাযোগ করে। ছবি না থাকলে পরে দিতে পারবেন।"
                  : "Clear photos get up to 5x more buyer calls. You can also skip if not ready."}
              </p>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Big Interactive Photo Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-3 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                imagePreview
                  ? "border-emerald-500 bg-emerald-50/20"
                  : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30"
              }`}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative mx-auto max-w-xs rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-500 max-h-64 flex items-center justify-center bg-black/5">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-auto object-cover max-h-64"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2">
                      <Camera className="w-5 h-5" />
                      {isBn ? "ছবি পরিবর্তন করুন" : "Change Photo"}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    {isBn ? "ছবি সফলভাবে যুক্ত হয়েছে! ক্লিক করে পরিবর্তন করতে পারেন।" : "Photo selected! Tap to replace."}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl mx-auto flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {isBn ? "মোবাইল ক্যামেরা দিয়ে ছবি তুলুন" : "Take Photo with Camera"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isBn ? "বা গ্যালারি থেকে ছবি বেছে নিন" : "or choose from your phone gallery"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {isBn ? "ছবি সিলেক্ট করুন" : "Select Photo"}
                  </button>
                </div>
              )}
            </div>

            {/* Skip note / fallback info */}
            {!imagePreview && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <span>💡</span>
                <span>
                  {isBn
                    ? "ছবি না থাকলেও সমস্যা নেই—আমরা স্বয়ংক্রিয়ভাবে ক্যাটাগরির মানসম্মত ছবি বসিয়ে দেব।"
                    : "No photo right now? No problem, we'll assign a standard category image."}
                </span>
              </div>
            )}

            {/* Next Button */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
              >
                <span>{isBn ? "পরের ধাপে যান (ধরণ ও নাম)" : "Next Step (Details)"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2: DETAILS & CATEGORY (নাম ও ধরণ)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                {isBn ? "ধাপ ২ এর ১" : "Category Selection"}
              </span>
              <h2 className="text-xl font-black text-slate-800 mt-1">
                {isBn ? "কাঁচামালের ধরণ বেছে নিন" : "Select Material Category"}
              </h2>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (!productName && cat.samples[0]) {
                        setProductName(cat.samples[0]);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-1 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 shadow-md shadow-emerald-100 scale-[1.02]"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className={`text-xs font-black leading-tight ${isSelected ? "text-emerald-900" : "text-slate-800"}`}>
                      {isBn ? cat.bn : cat.en}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Product Name Input */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                {isBn ? "কাঁচামালের নাম / সাইজ / ব্র্যান্ড *" : "Product Name / Grade / Brand *"}
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={isBn ? "যেমন: বিএসআরএম ৬০ গ্রেড রড বা এইচএমএস স্ক্র্যাপ" : "e.g., 60 Grade Steel Rod"}
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />

              {/* Sample Suggestions Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 mr-1">
                  {isBn ? "দ্রুত নাম বেছে নিন:" : "Quick suggestions:"}
                </span>
                {selectedCategory.samples.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setProductName(sample)}
                    className="text-xs font-bold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-xl transition-colors"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Selector */}
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                {isBn ? "মাপের একক (Unit) নির্বাচন করুন *" : "Select Measurement Unit *"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LOCAL_UNITS.map((u) => {
                  const isSel = selectedUnit === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUnit(u.id)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        isSel
                          ? "border-emerald-600 bg-emerald-600 text-white font-black shadow-md shadow-emerald-200"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                      }`}
                    >
                      <div className="text-xs">{isBn ? u.bn : u.en}</div>
                      <div className={`text-[10px] mt-0.5 ${isSel ? "text-emerald-100" : "text-slate-400"}`}>
                        {u.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                {isBn ? "পিছনে" : "Back"}
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
              >
                <span>{isBn ? "পরের ধাপে যান (দরদাম)" : "Next Step (Pricing)"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3: PRICING & STOCK (দরদাম ও স্টক)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                {isBn ? "ধাপ ৩ এর ৩" : "Pricing & Stock"}
              </span>
              <h2 className="text-xl font-black text-slate-800 mt-1">
                {isBn ? "দরদাম ও বিক্রয়ের বিবরণ দিন" : "Set Price & Availability"}
              </h2>
            </div>

            {/* Price Box */}
            <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-3xl p-5">
              <label className="block text-sm font-black text-emerald-950 mb-1">
                {isBn
                  ? `বিক্রয় দর (টাকা / প্রতি ${LOCAL_UNITS.find(u => u.id === selectedUnit)?.bn || selectedUnit}) *`
                  : `Price (BDT / per ${selectedUnit}) *`}
              </label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-700">
                  ৳
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={isBn ? "যেমন: ৮৫০০০" : "e.g. 85000"}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-emerald-300 rounded-2xl text-2xl font-black text-slate-900 focus:outline-none focus:border-emerald-600"
                  autoFocus
                />
              </div>
              <p className="text-xs text-emerald-800 mt-2 font-medium">
                {isBn
                  ? "💡 পাইকারি দর লিখুন। ক্রেতারা সরাসরি এই দরে কল বা অর্ডার করবে।"
                  : "Wholesale rate. Buyers will contact you based on this unit price."}
              </p>
            </div>

            {/* Minimum Order Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isBn ? "ন্যূনতম অর্ডার পরিমাণ *" : "Minimum Order *"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {selectedUnit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {isBn ? "মিলের/গুদামের এলাকা *" : "Location / Mill Area *"}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={isBn ? "যেমন: নারায়ণগঞ্জ / চট্টগ্রাম" : "e.g. Narayanganj"}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Instant Stock Status Toggle */}
            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-slate-900">
                  {isBn ? "স্টক স্ট্যাটাস (মাল কি রেডি আছে?)" : "Stock Availability"}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {inStock
                    ? (isBn ? "✅ বর্তমানে গুদামে মাল আছে" : "In Stock & Ready")
                    : (isBn ? "❌ স্টক শেষ / অগ্রিম অর্ডার" : "Currently Out of Stock")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
                  inStock ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                    inStock ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Direct Contact Phone Confirmation */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                {isBn ? "ক্রেতার যোগাযোগের মোবাইল নম্বর *" : "Contact Phone for Buyers *"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  📞
                </span>
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="01700-000000"
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Final Big Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(2)}
                className="w-1/3 py-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                {isBn ? "পিছনে" : "Back"}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {uploadingImage
                      ? (isBn ? "ছবি আপলোড হচ্ছে..." : "Uploading Photo...")
                      : (isBn ? "পণ্য পোস্ট হচ্ছে..." : "Publishing...")}
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{isBn ? "এখনই পোস্ট করুন ✓" : "Publish Now ✓"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 4: SUCCESS CONFIRMATION
        ══════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200 mb-2">
                🎉 {isBn ? "লাইভ হয়েছে!" : "Successfully Published!"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {isBn ? "আপনার পণ্য সফলভাবে পোস্ট হয়েছে!" : "Product Published Successfully!"}
              </h2>
              <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
                {isBn
                  ? `"${productName}" এখন শিল্পমার্কেটের সকল পাইকারি ক্রেতার কাছে প্রদর্শিত হচ্ছে।`
                  : `"${productName}" is now live on ShilpoMarket and visible to all wholesale buyers.`}
              </p>
            </div>

            {/* Product summary pill */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto flex items-center gap-4 text-left">
              <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                <img
                  src={createdProduct?.primaryImage || imagePreview || "/placeholder.jpg"}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{productName}</h4>
                <p className="text-xs text-slate-500">{selectedCategory.bn}</p>
                <p className="text-base font-black text-emerald-700 mt-0.5">
                  ৳ {parseFloat(price).toLocaleString()} / {selectedUnit}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              {createdProduct?._id && (
                <Link
                  href={`/products/${createdProduct._id}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-200 text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  {isBn ? "পণ্যটি লাইভ দেখুন" : "View Live Product"}
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setProductName("");
                  setPrice("");
                  setImageFile(null);
                  setImagePreview(null);
                  setCreatedProduct(null);
                }}
                className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-800 font-black py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                {isBn ? "আরেকটি পণ্য যোগ করুন" : "Add Another Product"}
              </button>
            </div>

            {/* Share to WhatsApp */}
            <div className="pt-4 border-t border-slate-100 max-w-md mx-auto">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `শিল্পমার্কেটে নতুন কাঁচামাল যোগ করেছি: ${productName} (দর: ৳${parseFloat(price).toLocaleString()}/${selectedUnit})। সরাসরি পাইকারি কিনতে যোগাযোগ করুন: ${sellerPhone}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-black rounded-2xl text-sm transition-all"
              >
                <span className="text-lg">💬</span>
                {isBn ? "হোয়াটসঅ্যাপে ক্রেতাদের সাথে শেয়ার করুন" : "Share on WhatsApp with Buyers"}
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
