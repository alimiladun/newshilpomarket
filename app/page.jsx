import Header from "../components/Header";
import WhatsAppWidget from "../components/WhatsAppWidget";
import Chatbot from "../components/Chatbot";

// Modular homepage components
import Hero from "../components/Homepage/Hero";
import DailyRatesTicker from "../components/Homepage/DailyRatesTicker";
import FeaturedProducts from "../components/Homepage/FeaturedProducts";
import FeaturedSuppliers from "../components/Homepage/FeaturedSuppliers";
import Partners from "../components/Homepage/Partners";
import Transactions from "../components/Homepage/Transactions";
import Testimonial from "../components/Homepage/Testimonial";
import Insights from "../components/Homepage/Insights";
import Ctc from "../components/Homepage/Ctc";

import { connectDB } from "../lib/database";
import Product from "../models/Product";
import Supplier from "../models/Supplier";

// ─── Server-side data fetch helpers ───────────────────────────────────────────

async function getFeaturedProducts() {
  try {
    await connectDB();
    const docs = await Product.find({ isActive: true })
      .select("_id name price unit minOrder inStock images primaryImage category rating reviewCount supplierName supplier location")
      .sort("-createdAt")
      .limit(8)
      .lean();

    return docs.map((p) => ({
      id: String(p._id),
      name: p.name,
      supplier: p.supplierName || "Unknown Supplier",
      price: `৳${p.price}/${p.unit || "unit"}`,
      image:
        p.primaryImage ||
        (Array.isArray(p.images) && p.images.length > 0
          ? typeof p.images[0] === "string"
            ? p.images[0]
            : p.images[0]?.url
          : null) ||
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      category: p.category || "General",
      rating: p.rating || 4.5,
      reviews: p.reviewCount || 0,
      minOrder: `${p.minOrder || 1} ${p.unit || "units"}`,
      inStock: p.inStock !== false,
    }));
  } catch (err) {
    console.error("getFeaturedProducts error:", err.message);
    return [];
  }
}

async function getTopSuppliers() {
  try {
    await connectDB();
    const docs = await Supplier.find({ isVerified: true })
      .select("_id companyName firstName lastName profileImage rating productCount location specialization")
      .sort("-rating")
      .limit(6)
      .lean();

    return docs.map((s) => ({
      id: String(s._id),
      name: s.companyName || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Supplier",
      logo:
        s.profileImage ||
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      products: s.productCount || 0,
      rating: s.rating || 4.5,
      location: s.location || "Bangladesh",
      verified: true,
      specialization: s.specialization || "Raw Materials",
      yearEstablished: s.yearEstablished || "—",
      employees: s.employees || "—",
    }));
  } catch (err) {
    console.error("getTopSuppliers error:", err.message);
    return [];
  }
}

// ─── Static data (fallbacks / testimonials / news) ────────────────────────────

const staticTestimonials = [
  {
    id: 1,
    name: "রহিম উদ্দিন",
    company: "ঢাকা স্টিল ট্রেডার্স",
    role: "মালিক",
    content: "শিল্পমার্কেটে এসে আমার ব্যবসা অনেক সহজ হয়েছে। সরাসরি ফোনে যোগাযোগ করতে পারি।",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
  },
  {
    id: 2,
    name: "করিম সাহেব",
    company: "চট্টগ্রাম কেমিক্যালস",
    role: "পরিচালক",
    content: "দাম তুলনা করা এবং সাপ্লায়ার খোঁজা এখন অনেক সহজ। ব্যবসায় লাভ বেড়েছে।",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  },
  {
    id: 3,
    name: "নাসরিন বেগম",
    company: "টেক্সটাইল মিলস বিডি",
    role: "ক্রয় বিভাগ",
    content: "কাঁচামালের সঠিক দর এবং বিশ্বস্ত সাপ্লায়ার পাওয়া এখন অনেক সহজ।",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b9c90c2d?w=80&h=80&fit=crop",
  },
];

const staticPartners = [
  { id: 1, name: "বাংলাদেশ স্টিল", logo: "🏭", industry: "ইস্পাত শিল্প", since: "২০১৯", volume: "৳৫.২M+" },
  { id: 2, name: "ইকো-প্লাস্টিক", logo: "♻️", industry: "পরিবেশবান্ধব পণ্য", since: "২০২০", volume: "৳৩.৮M+" },
  { id: 3, name: "টেক-ফাইবার", logo: "🧵", industry: "টেক্সটাইল", since: "২০১৮", volume: "৳৪.১M+" },
  { id: 4, name: "কেমকোর ইন্টল", logo: "⚗️", industry: "রাসায়নিক", since: "২০১৭", volume: "৳৬.৭M+" },
  { id: 5, name: "মেটালওয়ার্কস", logo: "🔧", industry: "ধাতু প্রক্রিয়াকরণ", since: "২০২১", volume: "৳২.৯M+" },
  { id: 6, name: "বিল্ডম্যাট", logo: "🏗️", industry: "নির্মাণ সামগ্রী", since: "২০১৯", volume: "৳৭.৩M+" },
];

const staticTransactions = [
  { id: 1, product: "এম এস রড", buyer: "কনস্ট্রাকশন কর্প", amount: "৳১,২৫,০০০", quantity: "১০০ টন", date: "২ ঘণ্টা আগে", status: "completed", country: "🇧🇩" },
  { id: 2, product: "প্লাস্টিক দানা", buyer: "ম্যানুফ্যাকচারিং ইনক", amount: "৳৮৫,০০০", quantity: "৫০ টন", date: "৪ ঘণ্টা আগে", status: "processing", country: "🇧🇩" },
  { id: 3, product: "তুলা সুতা", buyer: "টেক্সটাইল মিলস", amount: "৳২,১০,০০০", quantity: "৭৫ টন", date: "৬ ঘণ্টা আগে", status: "completed", country: "🇧🇩" },
  { id: 4, product: "অ্যালুমিনিয়াম", buyer: "এয়ারোস্পেস লিমিটেড", amount: "৳৩,৪০,০০০", quantity: "১২০ টন", date: "৮ ঘণ্টা আগে", status: "completed", country: "🇧🇩" },
];

const staticNewsBlogs = [
  {
    id: 1, slug: "steel-price-update-2024",
    title: "২০২৪ সালে স্টিলের দাম ১৫% বৃদ্ধি পেয়েছে",
    excerpt: "নির্মাণ ও অটোমোটিভ সেক্টরের চাহিদা বৃদ্ধির কারণে স্টিলের দাম বেড়েছে...",
    image: "https://images.unsplash.com/photo-1544473244-f6895e69ad8b?w=400&h=250&fit=crop",
    date: "ডিসে ১৫, ২০২৪", category: "বাজার খবর", readTime: "৫ মিনিট", author: "সম্পাদক", trending: true,
  },
  {
    id: 2, slug: "sustainable-raw-materials",
    title: "পরিবেশবান্ধব কাঁচামাল: ভবিষ্যতের শিল্প",
    excerpt: "কীভাবে ইকো-ফ্রেন্ডলি উপকরণ শিল্প উৎপাদনকে নতুন রূপ দিচ্ছে...",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    date: "ডিসে ১২, ২০২৪", category: "শিল্প বিশ্লেষণ", readTime: "৮ মিনিট", author: "বিশ্লেষক", trending: false,
  },
  {
    id: 3, slug: "trade-regulations-2024",
    title: "নতুন বাণিজ্য বিধিমালা: আমদানিকারকদের জন্য তথ্য",
    excerpt: "সরকারের নতুন নীতি কাঁচামাল আমদানিতে কী প্রভাব ফেলছে...",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
    date: "ডিসে ১০, ২০২৪", category: "বিধিমালা", readTime: "৬ মিনিট", author: "আইন বিশেষজ্ঞ", trending: true,
  },
  {
    id: 4, slug: "plastic-pellets-market",
    title: "প্লাস্টিক দানার বাজার: ২০২৫ সালের পূর্বাভাস",
    excerpt: "আগামী বছর প্লাস্টিক কাঁচামালের চাহিদা ও দাম কোন দিকে যাবে...",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop",
    date: "ডিসে ৮, ২০২৪", category: "বাজার বিশ্লেষণ", readTime: "৭ মিনিট", author: "সম্পাদক", trending: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch live data from MongoDB in parallel on the server
  const [featuredProducts, topCompanies] = await Promise.all([
    getFeaturedProducts(),
    getTopSuppliers(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <Hero />
      <DailyRatesTicker />

      {/* Featured Products — real DB data */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(219,234,254,0.35)_45%,transparent_75%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedProducts featuredProducts={featuredProducts} />
        </div>
      </section>

      {/* Featured Suppliers — real DB data, only if available */}
      {topCompanies.length > 0 && (
        <FeaturedSuppliers topCompanies={topCompanies} />
      )}

      <Partners partners={staticPartners} />
      <Transactions recentTransactions={staticTransactions} />
      <Testimonial testimonials={staticTestimonials} />
      <Insights newsBlogs={staticNewsBlogs} />
      <Ctc />
      <Chatbot />
      <WhatsAppWidget />
    </div>
  );
}