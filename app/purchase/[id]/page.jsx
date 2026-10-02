"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"
import Link from "next/link"
import { toast } from "sonner"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Package,
  AlertCircle,
  CreditCard,
  MapPin,
  Clock,
  ExternalLink
} from "lucide-react"

function PurchaseContent({ params }) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const productId = unwrappedParams?.id || routeParams?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const initialQty = parseInt(searchParams.get('quantity')) || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [formData, setFormData] = useState({
    quantity: initialQty,
    contactPhone: "",
    deliveryType: "truck_delivery", // "truck_delivery" or "buyer_pickup"
    deliveryAddress: "",
    billingAddress: "",
    sameAsDelivery: true,
    urgentDelivery: false,
    insurance: false,
    specialRequirements: "",
    paymentMethod: "bank_transfer",
    trxId: "",
    senderNumber: "",
    bankRef: ""
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        const p = data.product;
        setProduct(p);
        setFormData(prev => ({
          ...prev,
          quantity: Math.max(initialQty, p.minOrder || 1)
        }));
      } else {
        toast.error(isBn ? 'পণ্যটি পাওয়া যায়নি।' : 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(isBn ? 'পণ্য লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cost calculations
  const unitPrice = product ? Number(product.price) || 0 : 0;
  const subtotal = formData.quantity * unitPrice;
  const shippingCost = formData.deliveryType === 'buyer_pickup' 
    ? 0 
    : (formData.urgentDelivery ? 2500 : 1500);
  const insuranceCost = formData.insurance ? Math.round(subtotal * 0.01) : 0;
  const totalAmount = subtotal + shippingCost + insuranceCost;
  const advanceAmount = (formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad')
    ? Math.round(totalAmount * 0.1)
    : 0;

  const handleSubmitOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(isBn ? 'অর্ডার করতে অনুগ্রহ করে লগইন করুন।' : 'Please log in to place an order.');
        router.push(`/auth/login?redirect=/purchase/${productId}`);
        return;
      }

      if (!formData.deliveryAddress.trim() && formData.deliveryType === 'truck_delivery') {
        toast.error(isBn ? 'অনুগ্রহ করে ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন।' : 'Please enter full delivery address.');
        setStep(2);
        return;
      }

      if (!formData.contactPhone.trim()) {
        toast.error(isBn ? 'অনুগ্রহ করে সরাসরি যোগাযোগের মোবাইল নম্বর দিন।' : 'Please enter contact phone number.');
        setStep(1);
        return;
      }

      if ((formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad') && !formData.trxId.trim()) {
        toast.error(isBn ? 'অনুগ্রহ করে বিকাশ/নগদ TrxID লিখুন।' : 'Please enter bKash/Nagad TrxID.');
        return;
      }

      setSubmitting(true);

      const orderData = {
        productId: product._id,
        quantity: formData.quantity,
        contactPhone: formData.contactPhone,
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryAddress || (formData.deliveryType === 'buyer_pickup' ? 'Buyer Self-Pickup at Mill' : ''),
        billingAddress: formData.sameAsDelivery ? formData.deliveryAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        paymentDetails: {
          trxId: formData.trxId,
          senderNumber: formData.senderNumber,
          bankName: formData.bankRef,
          advanceAmount,
          dueAmount: totalAmount - advanceAmount
        },
        specialRequirements: formData.specialRequirements,
        urgentDelivery: formData.urgentDelivery,
        insurance: formData.insurance,
        shippingCost
      };

      const response = await fetch(`/api/buyers/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConfirmedOrder(data.order);
        setStep(4);
        toast.success(isBn ? 'অর্ডার সফলভাবে জমা দেওয়া হয়েছে!' : 'Order submitted successfully!');
      } else {
        toast.error(data.message || (isBn ? 'অর্ডার সাবমিট ব্যর্থ হয়েছে।' : 'Failed to submit order'));
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error(isBn ? 'সার্ভারে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' : 'Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    {
      id: "bank_transfer",
      name: isBn ? "ব্যাংক ট্রান্সফার / এনপিএসবি (Bank Transfer)" : "Bank Transfer / BEFTN",
      description: isBn ? "ইসলামী ব্যাংক, ব্র্যাক বা যেকোনো ব্যাংক থেকে সরাসরি ট্রান্সফার" : "Direct deposit to ShilpoMarket Trust Account",
      badge: isBn ? "বড় চালানের জন্য সেরা" : "Recommended for Bulk",
      icon: "🏦",
    },
    {
      id: "bkash",
      name: isBn ? "বিকাশ ১০% টোকেন বায়না (bKash Advance)" : "bKash 10% Token Advance",
      description: isBn ? "১০% বায়না দিয়ে অর্ডার লক করুন, বাকি টাকা মাল পৌঁছালে" : "Pay 10% booking token, balance on delivery",
      badge: isBn ? "জনপ্রিয় ও সহজ" : "Most Popular",
      icon: "📱",
    },
    {
      id: "nagad",
      name: isBn ? "নগদ ১০% টোকেন বায়না (Nagad Advance)" : "Nagad 10% Token Advance",
      description: isBn ? "নগদ মার্চেন্ট নম্বরে বায়না পরিশোধ করে ট্রানজেকশন আইডি দিন" : "Pay token advance via Nagad Merchant",
      badge: isBn ? "দ্রুত পেমেন্ট" : "Fast Payment",
      icon: "⚡",
    },
    {
      id: "cash_on_delivery",
      name: isBn ? "ক্যাশ অন চালান (Challan / Truck Delivery)" : "Cash on Delivery / Challan",
      description: isBn ? "গোডাউনে ট্রাক আসার পর ওজন ও চালান মেপে ড্রাইভারকে পরিশোধ" : "Inspect truck scale & challan before paying driver",
      badge: isBn ? "যাচাইকৃত ক্রেতা" : "Verified Buyers",
      icon: "🚚",
    },
    {
      id: "escrow",
      name: isBn ? "শিল্পমার্কেট এসক্রো ও ব্যাংক গ্যারান্টি" : "ShilpoMarket Escrow & LC",
      description: isBn ? "৫০ লাখ+ টাকার লেনদেনে সম্পূর্ণ সুরক্ষিত তৃতীয় পক্ষ তহবিল" : "Safe third-party custody for multi-lakh factory deals",
      badge: isBn ? "শতভাগ নিরাপদ" : "100% Secure",
      icon: "🔒",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium">{isBn ? 'অর্ডার পেজ লোড হচ্ছে...' : 'Loading order page...'}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full mx-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{isBn ? 'পণ্যটি পাওয়া যায়নি' : 'Product Not Found'}</h1>
            <p className="text-slate-600 mb-6 text-sm">{isBn ? 'পণ্যটি নিষ্ক্রিয় বা মুছে ফেলা হতে পারে।' : 'The item may be unavailable or deleted.'}</p>
            <Link href="/products" className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-medium px-6 py-2.5 rounded-xl transition-all">
              {isBn ? 'সব কাঁচামাল দেখুন' : 'Browse Products'}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Progress Stepper Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between sm:justify-center sm:space-x-12">
            {[
              { num: 1, label: isBn ? "অর্ডার বিবরণ" : "Order Details" },
              { num: 2, label: isBn ? "ডেলিভারি ও ঠিকানা" : "Delivery & Address" },
              { num: 3, label: isBn ? "পেমেন্ট মেথড" : "Payment Method" },
              { num: 4, label: isBn ? "নিশ্চিতকরণ" : "Confirmation" },
            ].map((s) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= s.num
                      ? "bg-blue-700 text-white ring-4 ring-blue-100"
                      : "bg-slate-100 text-slate-500 border border-slate-300"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`ml-2 text-xs sm:text-sm font-semibold hidden md:inline ${
                  step >= s.num ? "text-blue-900" : "text-slate-500"
                }`}>
                  {s.label}
                </span>
                {s.num < 4 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${step > s.num ? "bg-blue-700" : "bg-slate-200"}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Wizard Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              
              {/* Step 1: Order Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-6 h-6 text-blue-700" />
                      {isBn ? "অর্ডার বিবরণ ও পরিমাণ" : "Order Details & Quantity"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      {isBn ? "আপনার প্রয়োজনীয় কাঁচামালের পরিমাণ এবং যোগাযোগের নম্বর নির্ধারণ করুন।" : "Specify required quantity and direct contact information."}
                    </p>
                  </div>

                  {/* Product Highlight Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                    <img
                      src={product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : null) || product.primaryImage || "/placeholder.svg"}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-1">
                        {product.category || (isBn ? 'শিল্প কাঁচামাল' : 'Raw Material')}
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg truncate">{product.name}</h3>
                      <p className="text-slate-600 text-sm flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {product.supplierName || (isBn ? 'যাচাইকৃত সরবরাহকারী' : 'Verified Supplier')}
                      </p>
                      <p className="text-blue-700 font-extrabold text-lg mt-0.5">
                        ৳{product.price?.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {product.unit || 'কেজি'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Selection */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                    <label className="block text-sm font-bold text-slate-800">
                      {isBn ? `প্রয়োজনীয় পরিমাণ (${product.unit || 'কেজি'})` : `Required Quantity (${product.unit || 'units'})`}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleInputChange("quantity", Math.max(product.minOrder || 1, formData.quantity - 1))}
                        className="w-12 h-12 border border-slate-300 rounded-xl flex items-center justify-center font-bold text-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-700"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          handleInputChange(
                            "quantity",
                            Math.max(product.minOrder || 1, parseInt(e.target.value) || (product.minOrder || 1)),
                          )
                        }
                        min={product.minOrder || 1}
                        className="w-36 h-12 border-2 border-slate-300 rounded-xl text-center font-bold text-xl focus:outline-none focus:border-blue-700 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange("quantity", formData.quantity + 1)}
                        className="w-12 h-12 border border-slate-300 rounded-xl flex items-center justify-center font-bold text-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-700"
                      >
                        +
                      </button>
                      <span className="text-slate-600 font-semibold text-sm">
                        {product.unit || 'কেজি'}
                      </span>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[10, 50, 100, 500].map((addQty) => (
                        <button
                          key={addQty}
                          type="button"
                          onClick={() => handleInputChange("quantity", formData.quantity + addQty)}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-semibold transition-all border border-slate-200"
                        >
                          +{addQty} {product.unit || ''}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {isBn 
                        ? `এই পণ্যের সর্বনিম্ন অর্ডারের পরিমাণ: ${product.minOrder || 1} ${product.unit || 'কেজি'}`
                        : `Minimum order requirement: ${product.minOrder || 1} ${product.unit || 'units'}`}
                    </p>
                  </div>

                  {/* Direct Contact Phone Number */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      {isBn ? "সরাসরি যোগাযোগের মোবাইল নম্বর" : "Direct Contact Mobile Number"}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-900"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {isBn ? "অর্ডার নিশ্চিত করতে সরবরাহকারী বা শিল্পমার্কেট প্রতিনিধি এই নম্বরে কল করবেন।" : "Supplier or operations will call this number to confirm logistics."}
                    </p>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      {isBn ? "কাঁচামালের বিশেষ স্পেসিফিকেশন বা নোট (ঐচ্ছিক)" : "Material Specifications / Notes (Optional)"}
                    </label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
                      placeholder={isBn ? "যেমন: ৬০-গ্রেড বিএসআরএম রড, ভার্জিন গ্রেড পিউরিটি, ইত্যাদি..." : "e.g., 60-grade rebar, virgin grade purity specifications..."}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Delivery & Shipping */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-6 h-6 text-blue-700" />
                      {isBn ? "ডেলিভারি ও পরিবহন ব্যবস্থা" : "Delivery & Transport Logistics"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      {isBn ? "আপনার সুবিধাজনক ডেলিভারি পদ্ধতি ও কারখানা/গোডাউনের ঠিকানা নির্বাচন করুন।" : "Select delivery type and specify warehouse/factory destination."}
                    </p>
                  </div>

                  {/* Delivery Type Option Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => handleInputChange("deliveryType", "truck_delivery")}
                      className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                        formData.deliveryType === "truck_delivery"
                          ? "border-blue-700 bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🚚</span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{isBn ? "ট্রাক পরিবহন ডেলিভারি" : "Truck Transport Delivery"}</h4>
                          <p className="text-slate-600 text-xs mt-1">
                            {isBn ? "সরাসরি আপনার কারখানা বা গোডাউনে ট্রাক পৌঁছে দেওয়া হবে।" : "Direct truck transport to your factory or warehouse gate."}
                          </p>
                          <span className="inline-block mt-3 text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
                            {isBn ? "ভাড়া: ৳১,৫০০ (প্রাক্কলিত)" : "Est. Transport: ৳1,500"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => handleInputChange("deliveryType", "buyer_pickup")}
                      className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                        formData.deliveryType === "buyer_pickup"
                          ? "border-blue-700 bg-blue-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🏭</span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{isBn ? "মিল গেট থেকে নিজস্ব পিকআপ" : "Buyer Self-Pickup at Mill Gate"}</h4>
                          <p className="text-slate-600 text-xs mt-1">
                            {isBn ? "ক্রেতা নিজ ব্যবস্থাপনায় মিল/ডিপো থেকে ট্রাক দিয়ে কাঁচামাল তুলবেন।" : "Pick up material directly using your own transport vehicle."}
                          </p>
                          <span className="inline-block mt-3 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                            {isBn ? "ডেলিভারি খরচ: ৳০ (ফ্রি)" : "Delivery Fee: ৳0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {formData.deliveryType === 'truck_delivery' ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        {isBn ? "ডেলিভারির সম্পূর্ণ ঠিকানা (কারখানা/গোডাউন)" : "Complete Delivery Address (Factory/Warehouse)"}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
                        placeholder={isBn ? "কোম্পানির নাম, রোড/প্লট নং, শিল্পাঞ্চল, থানা এবং জেলা..." : "Company Name, Plot/Road No., Industrial Area, Police Station & District..."}
                        required
                      />
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-sm">
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {isBn ? "পিকআপ পয়েন্ট লোকেশন:" : "Pickup Point Location:"}
                      </p>
                      <p className="text-emerald-800">
                        {product.location ? `${product.location} (সাপ্লায়ারের মিল/ডিপো গেট)` : (isBn ? "সাপ্লায়ারের নিবন্ধিত মিল গেট, নারায়ণগঞ্জ / চট্টগ্রাম" : "Supplier Registered Mill Gate")}
                      </p>
                    </div>
                  )}

                  {/* Logistics Add-ons */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center space-x-3 p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.urgentDelivery}
                        onChange={(e) => handleInputChange("urgentDelivery", e.target.checked)}
                        className="w-5 h-5 text-blue-700 rounded focus:ring-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 text-sm">
                          {isBn ? "জরুরি অগ্রাধিকার ডেলিভারি (২৪-৪৮ ঘণ্টায় পরিবহন বরাদ্দ)" : "Urgent Priority Dispatch (24-48h Vehicle Allocation)"}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isBn ? "অতিরিক্ত ৳১,০০০ দ্রুত পরিবহন সমন্বয় চার্জ" : "+৳1,000 expedited transport coordinator fee"}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.insurance}
                        onChange={(e) => handleInputChange("insurance", e.target.checked)}
                        className="w-5 h-5 text-blue-700 rounded focus:ring-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 text-sm">
                          {isBn ? "পরিবহন ক্ষতি বীমা (Transit Insurance - ১%)" : "Goods in Transit Insurance (+1% of value)"}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isBn ? "পথে দুর্ঘটনা বা মাল নষ্ট হলে শতভাগ ক্ষতিপূরণ গ্যারান্টি" : "Full coverage against road accident or material loss during transit"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-blue-700" />
                      {isBn ? "পেমেন্ট মেথড নির্বাচন করুন" : "Select Payment Method"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      {isBn ? "নিরাপদ লেনদেনের জন্য আপনার সুবিধাজনক মাধ্যমটি নির্বাচন করুন।" : "Choose your preferred payment method for trade security."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => handleInputChange("paymentMethod", method.id)}
                        className={`border-2 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id
                            ? "border-blue-700 bg-blue-50/40 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-2xl sm:text-3xl mt-0.5">{method.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-base">{method.name}</h3>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                                {method.badge}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs sm:text-sm mt-1">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Instructions per Payment Method */}
                  {(formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad') && (
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <span>{formData.paymentMethod === 'bkash' ? '🌸' : '⚡'}</span>
                          {isBn 
                            ? `${formData.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} ১০% টোকেন অগ্রিম পরিশোধ`
                            : `${formData.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} 10% Token Advance Payment`}
                        </h4>
                        <span className="font-extrabold text-pink-700 text-base">
                          ৳{advanceAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-pink-100 text-xs sm:text-sm text-slate-700 space-y-1">
                        <p><strong>মার্চেন্ট ওয়ালেট:</strong> <code className="bg-pink-100 text-pink-900 px-2 py-0.5 rounded font-mono font-bold">01401-658685</code> (Make Payment / মার্চেন্ট পেমেন্ট)</p>
                        <p className="text-slate-500 text-xs">বাকি ৳{(totalAmount - advanceAmount).toLocaleString()} মাল পৌঁছালে চালান দেখে পরিশোধ করবেন।</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {isBn ? "প্রেরকের বিকাশ/নগদ নম্বর" : "Sender Mobile Number"}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.senderNumber}
                            onChange={(e) => handleInputChange("senderNumber", e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3.5 py-2.5 bg-white border border-pink-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {isBn ? "TrxID (ট্রানজেকশন আইডি)" : "Transaction ID (TrxID)"}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.trxId}
                            onChange={(e) => handleInputChange("trxId", e.target.value)}
                            placeholder="e.g. BKT78291A"
                            className="w-full px-3.5 py-2.5 bg-white border border-pink-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'bank_transfer' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        {isBn ? "শিল্পমার্কেট ট্রাস্ট ব্যাংক হিসাব বিবরণ" : "ShilpoMarket Trust Bank Details"}
                      </h4>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1.5 font-mono">
                        <p><strong>ব্যাংক:</strong> Islami Bank Bangladesh PLC / City Bank Ltd.</p>
                        <p><strong>হিসাবের নাম:</strong> ShilpoMarket Escrow Trade Services</p>
                        <p><strong>অ্যাকাউন্ট নং:</strong> 2050777010048291</p>
                        <p><strong>রাউটিং নম্বর:</strong> 125272844 | <strong>শাখা:</strong> মতিঝিল কর্পোরেট শাখা, ঢাকা</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {isBn ? "ডিপোজিট স্লিপ রেফারেন্স / চেক নং (ঐচ্ছিক)" : "Deposit Slip Ref / Cheque No. (Optional)"}
                        </label>
                        <input
                          type="text"
                          value={formData.bankRef}
                          onChange={(e) => handleInputChange("bankRef", e.target.value)}
                          placeholder={isBn ? "ব্যাংক ডিপোজিট বা রেফারেন্স নম্বর লিখুন" : "Enter bank deposit slip ref or cheque no."}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'cash_on_delivery' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-sm space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {isBn ? "কোনো অগ্রিম বায়না লাগবে না" : "Zero Advance Required"}
                      </p>
                      <p className="text-emerald-800 text-xs sm:text-sm">
                        {isBn 
                          ? "ট্রাক আপনার কারখানা বা গোডাউনে পৌঁছানোর পর ওজন স্কেল মেপে এবং চালান যাচাই করে সরাসরি ড্রাইভার বা আমাদের প্রতিনিধিকে পরিশোধ করুন।"
                          : "Inspect material weight and challan at your warehouse gate before handing payment to the delivery driver."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {isBn ? "অর্ডার সফলভাবে সম্পন্ন হয়েছে!" : "Order Placed Successfully!"}
                    </h2>
                    <p className="text-slate-600 mt-2 text-sm max-w-md mx-auto">
                      {isBn 
                        ? "আপনার ক্রয় প্রস্তাবটি সরবরাহকারী ও শিল্পমার্কেট অপারেশন টিমের কাছে পৌঁছেছে।"
                        : "Your purchase order has been dispatched to the supplier and ShilpoMarket operations."}
                    </p>
                  </div>

                  {confirmedOrder && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-md mx-auto space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 font-medium">{isBn ? "অর্ডার ট্র্যাকিং নং:" : "Order Tracking ID:"}</span>
                        <span className="font-mono font-bold text-blue-700">{confirmedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500 font-medium">{isBn ? "মোট টাকার অঙ্ক:" : "Total Amount:"}</span>
                        <span className="font-extrabold text-slate-900">৳{confirmedOrder.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500 font-medium">{isBn ? "পেমেন্ট স্ট্যাটাস:" : "Payment Status:"}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {confirmedOrder.paymentStatus === 'processing' ? (isBn ? 'যাচাই চলছে' : 'Verifying') : (isBn ? 'পেন্ডিং' : 'Pending')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 1-Tap Instant WhatsApp Support */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <a
                      href={`https://wa.me/8801401658685?text=${encodeURIComponent(
                        `হ্যালো শিল্পমার্কেট, আমি অর্ডার নং ${confirmedOrder?.orderNumber || ''} প্লেস করেছি (${product.name}, পরিমাণ: ${formData.quantity} ${product.unit || 'কেজি'})। অনুগ্রহ করে দ্রুত কনফার্ম করুন।`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      {isBn ? "হোয়াটসঅ্যাপে নিশ্চিত করুন" : "Confirm on WhatsApp"}
                    </a>
                    <a
                      href="tel:+8801401658685"
                      className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      {isBn ? "হটলাইনে কল করুন" : "Call Hotline"}
                    </a>
                  </div>

                  <div className="pt-4 flex justify-center gap-4 text-sm font-semibold">
                    <Link
                      href="/buyer/dashboard/orders"
                      className="text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {isBn ? "আমার অর্ডার তালিকা দেখুন" : "View My Orders"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link
                      href="/products"
                      className="text-slate-600 hover:underline"
                    >
                      {isBn ? "আরও পণ্য খুঁজুন" : "Browse More"}
                    </Link>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Buttons */}
              {step < 4 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                      step === 1
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {isBn ? "পূর্ববর্তী" : "Previous"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1) {
                        if (!formData.contactPhone.trim()) {
                          toast.error(isBn ? 'অনুগ্রহ করে সরাসরি যোগাযোগের মোবাইল নম্বর দিন।' : 'Please enter contact phone number.');
                          return;
                        }
                        setStep(2);
                      } else if (step === 2) {
                        if (formData.deliveryType === 'truck_delivery' && !formData.deliveryAddress.trim()) {
                          toast.error(isBn ? 'অনুগ্রহ করে ডেলিভারির ঠিকানা লিখুন।' : 'Please enter delivery address.');
                          return;
                        }
                        setStep(3);
                      } else if (step === 3) {
                        handleSubmitOrder();
                      }
                    }}
                    disabled={submitting}
                    className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isBn ? 'অর্ডার জমা হচ্ছে...' : 'Submitting Order...'}
                      </>
                    ) : step === 3 ? (
                      isBn ? "অর্ডার নিশ্চিত করুন" : "Confirm & Place Order"
                    ) : (
                      <>
                        {isBn ? "পরবর্তী ধাপ" : "Continue"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Order Price Summary Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>{isBn ? "অর্ডার সারাংশ" : "Order Summary"}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                  B2B Wholesale
                </span>
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>{isBn ? "কাঁচামাল:" : "Product:"}</span>
                  <span className="font-bold text-slate-800 truncate max-w-[160px]">{product.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isBn ? "পরিমাণ:" : "Quantity:"}</span>
                  <span className="font-bold text-slate-800">
                    {formData.quantity} {product.unit || 'কেজি'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isBn ? "একক দর:" : "Unit Price:"}</span>
                  <span className="font-bold text-slate-800">৳{unitPrice.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2.5">
                  <div className="flex justify-between text-slate-600">
                    <span>{isBn ? "মোট পণ্যমূল্য:" : "Material Subtotal:"}</span>
                    <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-600">
                    <span>{isBn ? "পরিবহন খরচ:" : "Transport Fee:"}</span>
                    <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {shippingCost === 0 ? (isBn ? '৳০ (নিজস্ব পিকআপ)' : '৳0 (Pickup)') : `৳${shippingCost.toLocaleString()}`}
                    </span>
                  </div>

                  {formData.insurance && (
                    <div className="flex justify-between text-slate-600">
                      <span>{isBn ? "পরিবহন বীমা (১%):" : "Transit Insurance (1%):"}</span>
                      <span className="font-bold text-slate-900">৳{insuranceCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-slate-200 pt-3.5 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-slate-900">{isBn ? "সর্বমোট প্রদেয়:" : "Total Payable:"}</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-800">৳{totalAmount.toLocaleString()}</span>
                      <p className="text-[11px] text-slate-500 font-normal">BDT (টাকা)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Trust Badge */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{isBn ? "শিল্পমার্কেট ১০০% ট্রেড গ্যারান্টি সুরক্ষাপ্রাপ্ত" : "Protected by ShilpoMarket Trade Assurance"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 px-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? "গড় ডেলিভারি সময়: ২৪-৭২ কর্মঘণ্টা" : "Avg. Delivery: 24-72 Business Hours"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PurchasePage({ params }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PurchaseContent params={params} />
    </Suspense>
  );
}
