"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import PostRFQModal from '../../../components/PostRFQModal';
import InvoiceModal from '../../../components/InvoiceModal';
import NotificationDrawer from '../../../components/NotificationDrawer';
import { soundAlert } from '../../../lib/soundAlert';
import { toast } from 'sonner';
import {
  ShoppingCart,
  LayoutDashboard,
  Settings,
  LogOut,
  Package,
  TrendingUp,
  FileText,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Phone,
  Building2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function UnifiedMerchantDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: "buyer" or "seller"
  const initialMode = searchParams.get('mode') === 'seller' ? 'seller' : 'buyer';
  const [activeMode, setActiveMode] = useState(initialMode);
  
  const [stats, setStats] = useState({
    buyer: {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalSpent: 0,
      totalRfqs: 0,
      recentOrders: []
    },
    seller: {
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      productsListed: 0,
      revenue: 0,
      recentOrders: [],
      recentProducts: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isPostRFQOpen, setIsPostRFQOpen] = useState(false);
  
  // Real-time SMS Test State
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setTestPhone(user.phone);
    }
  }, [user]);

  const handleSendTestSms = async (e) => {
    e.preventDefault();
    if (!testPhone) {
      toast.error(isBn ? 'অনুগ্রহ করে মোবাইল নম্বর লিখুন' : 'Please enter a mobile number');
      return;
    }
    setIsSendingSms(true);
    try {
      const res = await fetch('/api/notifications/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isBn ? `মোবাইলে টেস্ট SMS সফলভাবে পাঠানো হয়েছে (${data.data?.smsStatus})` : `Test SMS sent successfully (${data.data?.smsStatus})`);
        soundAlert.play('order');
        setShowSmsModal(false);
      } else {
        toast.error(data.message || 'SMS পাঠাতে ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error('সার্ভার এরর, পুনরায় চেষ্টা করুন');
    } finally {
      setIsSendingSms(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchStats();
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✓ ডেলিভার্ড</span>;
      case 'shipping':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">🚚 ট্রাকে চলমান</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">⚙️ প্রস্তুত হচ্ছে</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">✓ কনফার্মড</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">⏳ পেন্ডিং</span>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-semibold">{isBn ? 'ড্যাশবোর্ড লোড হচ্ছে...' : 'Loading Merchant Dashboard...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Merchant Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="ShilpoMarket" className="h-8 w-auto" />
              <span className="font-extrabold text-slate-900 text-lg hidden sm:inline">
                {isBn ? "শিল্পমার্কেট" : "ShilpoMarket"}
              </span>
            </Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 hidden sm:inline">
              ট্রেডার পোর্টাল
            </span>
          </div>

          {/* ── 1-CLICK UNIFIED MODE SWITCHER ── */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveMode('buyer')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
                activeMode === 'buyer'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isBn ? "ক্রেতা মোড (Buyer)" : "Buyer Mode"}</span>
            </button>
            <button
              onClick={() => setActiveMode('seller')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
                activeMode === 'seller'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{isBn ? "বিক্রেতা মোড (Seller)" : "Seller Mode"}</span>
            </button>
          </div>

          {/* Right User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Notification Bell & Sound Alerts */}
            <NotificationDrawer />

            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-blue-700 hidden md:inline"
            >
              {isBn ? "মার্কেটপ্লেসে ফিরুন" : "Marketplace"}
            </Link>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Welcome Merchant Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-blue-300">
                {activeMode === 'buyer' 
                  ? (isBn ? "🛒 কাঁচামাল ক্রয় পোর্টাল" : "Procurement Portal")
                  : (isBn ? "🏭 কাঁচামাল বিক্রয় ও সাপ্লাই পোর্টাল" : "Supplier Sales Portal")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {user?.companyName || user?.firstName ? `${user?.companyName || user?.firstName}-এর ড্যাশবোর্ড` : "ট্রেডার ড্যাশবোর্ড"}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                {activeMode === 'buyer'
                  ? "আপনার সাম্প্রতিক ক্রয় অর্ডার, ডেলিভারি ট্র্যাকিং ও দরপত্র এক নজরে দেখুন।"
                  : "আপনার সাপ্লাই অর্ডার, তালিকাভুক্ত কাঁচামাল ও মোট বিক্রয় আয় পর্যবেক্ষণ করুন।"}
              </p>
            </div>

            {/* Top Quick Actions depending on Mode */}
            <div className="flex flex-wrap gap-2.5">
              {activeMode === 'buyer' ? (
                <>
                  <button
                    onClick={() => setIsPostRFQOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {isBn ? "দরপত্র আহ্বান করুন" : "Post RFQ"}
                  </button>
                  <Link
                    href="/products"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isBn ? "কাঁচামাল খুঁজুন" : "Browse Materials"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/seller/dashboard/products/quick-add"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {isBn ? "৩০ সেকেন্ডে পণ্য যোগ করুন" : "Quick Add Product"}
                  </Link>
                  <Link
                    href="/rfq"
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    {isBn ? "বাল্ক দরপত্রে বিড দিন" : "Bid on RFQs"}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── REAL-TIME SMS & AUDIO ALERTS BAR ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80 shrink-0 shadow-sm">
              <Phone className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {isBn ? "লাইভ মোবাইল SMS ও সাউন্ড অ্যালার্ট" : "Real-time Mobile SMS & Sound Alerts"}
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  সক্রিয়
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn 
                  ? "নতুন পাইকারি অর্ডার, কোটেশন ও চালানের প্রতিটি আপডেট স্বয়ংক্রিয়ভাবে ফোনে SMS ও সাউন্ডের মাধ্যমে জানানো হবে।" 
                  : "Instant SMS & sound chime on every wholesale order, quote, and delivery challan."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={() => {
                soundAlert.play('order');
                toast.info(isBn ? "🎶 টেস্ট ট্রেড সাউন্ড বাজানো হলো" : "Played test trade sound");
              }}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
            >
              <span>🔔 সাউন্ড টেস্ট</span>
            </button>
            <button
              onClick={() => setShowSmsModal(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <span>📱 টেস্ট SMS পাঠান</span>
            </button>
          </div>
        </div>

        {/* ── 4 REAL KPI METRIC CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeMode === 'buyer' ? (
            <>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "মোট ক্রয় অর্ডার" : "Total Orders"}</span>
                  <ShoppingCart className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats.buyer.totalOrders}
                </div>
                <p className="text-[11px] text-slate-400">লাইভ ডেটাবেস অর্ডার</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "চলমান ডেলিভারি" : "In Transit"}</span>
                  <Truck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-700">
                  {stats.buyer.pendingOrders}
                </div>
                <p className="text-[11px] text-indigo-500">ট্রাক পরিবহনে বা প্রসেসিংয়ে</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "সর্বমোট ক্রয় ব্যয়" : "Total Spent"}</span>
                  <span className="font-extrabold text-emerald-700 text-sm">৳ BDT</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
                  ৳{stats.buyer.totalSpent.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-600">নিশ্চিতকৃত পাইকারি ক্রয়</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "আমার দরপত্র (RFQ)" : "My RFQs"}</span>
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-700">
                  {stats.buyer.totalRfqs}
                </div>
                <p className="text-[11px] text-slate-400">পোস্ট করা বাল্ক চাহিদা</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "মোট বিক্রয় অর্ডার" : "Sales Orders"}</span>
                  <Package className="w-4 h-4 text-blue-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats.seller.totalOrders}
                </div>
                <p className="text-[11px] text-slate-400">প্রাপ্ত পাইকারি ক্রয়াদেশ</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "অপেক্ষমাণ সরবরাহ" : "Pending Orders"}</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700">
                  {stats.seller.pendingOrders}
                </div>
                <p className="text-[11px] text-amber-600">শিপিং বা কোটেশন অপেক্ষমাণ</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "মোট বিক্রয় আয়" : "Total Revenue"}</span>
                  <span className="font-extrabold text-emerald-700 text-sm">৳ BDT</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
                  ৳{stats.seller.revenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-600">আসল ডেটাবেস ট্রানজেকশন</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">{isBn ? "তালিকাভুক্ত পণ্য" : "Active Products"}</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-700">
                  {stats.seller.productsListed}
                </div>
                <p className="text-[11px] text-slate-400">সক্রিয় কাঁচামাল ক্যাটালগ</p>
              </div>
            </>
          )}
        </div>

        {/* ── RECENT ORDERS & ACTIVITY TABLE ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeMode === 'buyer' 
                  ? (isBn ? "আমার সাম্প্রতিক ক্রয় অর্ডারসমূহ" : "Recent Purchase Orders")
                  : (isBn ? "প্রাপ্ত সাম্প্রতিক সাপ্লাই অর্ডারসমূহ" : "Recent Sales Orders Received")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeMode === 'buyer'
                  ? "ডেলিভারি চালান দেখতে এবং ট্র্যাকিং করতে অর্ডারে ক্লিক করুন।"
                  : "অর্ডার কনফার্ম করতে এবং ট্রাক চালানের কপি দেখতে তালিকা দেখুন।"}
              </p>
            </div>

            <Link
              href={activeMode === 'buyer' ? "/buyer/dashboard/orders" : "/seller/dashboard/orders"}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              {isBn ? "সব অর্ডার দেখুন" : "View All"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Orders List */}
          {((activeMode === 'buyer' ? stats.buyer.recentOrders : stats.seller.recentOrders) || []).length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-semibold">
                {activeMode === 'buyer' 
                  ? (isBn ? "আপনার এখনো কোনো ক্রয় অর্ডার নেই।" : "No purchase orders yet.")
                  : (isBn ? "আপনার কাছে এখনো কোনো বিক্রয় অর্ডার আসেনি।" : "No sales orders received yet.")}
              </p>
              <div className="pt-2">
                {activeMode === 'buyer' ? (
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {isBn ? "কাঁচামালের তালিকা দেখুন" : "Browse Raw Materials"}
                  </Link>
                ) : (
                  <Link
                    href="/seller/dashboard/products/quick-add"
                    className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {isBn ? "পণ্য আপলোড করুন" : "Upload Products"}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(activeMode === 'buyer' ? stats.buyer.recentOrders : stats.seller.recentOrders).map((order) => (
                <div
                  key={order._id}
                  className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={order.product?.primaryImage || (typeof order.product?.images?.[0] === 'string' ? order.product.images[0] : null) || "/placeholder.svg"}
                      alt={order.product?.name || "Product"}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">#{order.orderNumber}</span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{order.product?.name || "শিল্প কাঁচামাল"}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span>📦 {order.quantity} {order.product?.unit || 'কেজি'}</span>
                        <span>•</span>
                        <span>{activeMode === 'buyer' ? `সাপ্লায়ার: ${order.supplier?.companyName || 'যাচাইকৃত'}` : `ক্রেতা: ${order.buyer?.companyName || order.buyer?.firstName || 'বায়ার'}`}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">৳{order.totalAmount?.toLocaleString()}</span>
                      <p className="text-[11px] text-slate-500 uppercase">{order.paymentMethod?.replace('_', ' ')}</p>
                    </div>

                    {/* 1-Click Printable Delivery Challan Modal Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isBn ? "চালান / ইনভয়েস" : "Challan"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Post RFQ Modal */}
      <PostRFQModal
        isOpen={isPostRFQOpen}
        onClose={() => setIsPostRFQOpen(false)}
        onSuccess={() => fetchStats()}
      />

      {/* Printable Wholesale Invoice / Challan Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={!!selectedInvoiceOrder}
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Test SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  📱
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isBn ? "মোবাইল SMS টেস্ট করুন" : "Test Mobile SMS Alert"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn ? "আপনার ফোনে সরাসরি টেস্ট অ্যালার্ট পাঠান" : "Send direct test SMS to your phone"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestSms} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBn ? "বাংলাদেশি মোবাইল নম্বর (১১ ডিজিট)" : "BD Mobile Number (11 digits)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                    🇧🇩 +88
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="01712345678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="w-full pl-20 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  উদাহরণ: 01712345678 বা 018... বা 019...
                </p>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold">📩 মেসেজ প্রিভিউ:</p>
                <p className="text-slate-600 italic">
                  "শিল্পমার্কেট: এটি একটি পরীক্ষামূলক টেস্ট SMS অ্যালার্ট। আপনার ট্রেডার অ্যাকাউন্ট সক্রিয় রয়েছে। হটলাইন: ০১৪০১-৬৫৮৬৮৫"
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSmsModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSendingSms}
                  className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isSendingSms ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <span>{isBn ? "SMS পাঠান 🚀" : "Send SMS 🚀"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>শিল্পমার্কেট ট্রেডার ড্যাশবোর্ড • সর্বস্বত্ব সংরক্ষিত ২০২৬ • হেল্পলাইন: ০১৪০১-৬৫৮৬৮৫</p>
      </footer>
    </div>
  );
}
