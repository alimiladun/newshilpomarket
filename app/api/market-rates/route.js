import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import MarketRate from '@/models/MarketRate';

const INITIAL_RATES = [
  {
    materialName: "৬০-গ্রেড এম এস রড (BSRM/KSRM/AKS)",
    materialNameEn: "60-Grade MS Rebar (BSRM/KSRM/AKS)",
    category: "steel",
    price: 78.0,
    prevPrice: 76.5,
    change: 1.5,
    trend: "up",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "ডেমরা ও কদমতলী, ঢাকা",
    marketHubEn: "Demra & Kadamtali, Dhaka",
    qualityGrade: "বিএসটিআই ও বুয়েট টেস্টেড ৬০-গ্রেড",
    isFeatured: true,
  },
  {
    materialName: "হেভি মেল্টিং স্ক্র্যাপ লোহা (HMS 1/2)",
    materialNameEn: "Heavy Melting Scrap Metal (HMS 1/2)",
    category: "scrap",
    price: 48.5,
    prevPrice: 49.0,
    change: -0.5,
    trend: "down",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "সীতাকুণ্ড, চট্টগ্রাম",
    marketHubEn: "Sitakunda, Chittagong",
    qualityGrade: "জাহাজ ভাঙা প্রিমিয়াম স্ক্র্যাপ",
    isFeatured: true,
  },
  {
    materialName: "ভার্জিন পিপি প্লাস্টিক দানা (PP Granules)",
    materialNameEn: "Virgin Polypropylene Granules (PP)",
    category: "plastic",
    price: 145.0,
    prevPrice: 145.0,
    change: 0.0,
    trend: "stable",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "বাবুবাজার ও চকবাজার, ঢাকা",
    marketHubEn: "Babubazar & Chawkbazar, Dhaka",
    qualityGrade: "সৌদি সাবিক ইনজেকশন গ্রেড",
    isFeatured: true,
  },
  {
    materialName: "এইচডিপিই ব্লো মোল্ডিং প্লাস্টিক দানা",
    materialNameEn: "HDPE Blow Molding Granules",
    category: "plastic",
    price: 138.0,
    prevPrice: 136.5,
    change: 1.5,
    trend: "up",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "চকবাজার, পুরান ঢাকা",
    marketHubEn: "Chawkbazar, Old Dhaka",
    qualityGrade: "ফিল্ম ও বোতল গ্রেড",
    isFeatured: true,
  },
  {
    materialName: "কটন সুতা ৩০/১ কার্ডেড (Cotton Yarn)",
    materialNameEn: "100% Cotton Yarn 30/1 Carded",
    category: "textile",
    price: 380.0,
    prevPrice: 372.0,
    change: 8.0,
    trend: "up",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "তানজিম মার্কেট, নারায়ণগঞ্জ",
    marketHubEn: "Narayanganj Hub",
    qualityGrade: "হোসিয়ারি ও উইভিং গ্রেড",
    isFeatured: true,
  },
  {
    materialName: "কম্বড সুতা ৪০/১ (Combed Yarn)",
    materialNameEn: "Combed Cotton Yarn 40/1",
    category: "textile",
    price: 420.0,
    prevPrice: 420.0,
    change: 0.0,
    trend: "stable",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "টঙ্গী ও নরসিংদী",
    marketHubEn: "Tongi & Narsingdi",
    qualityGrade: "১০০% এক্সপোর্ট কোয়ালিটি",
    isFeatured: false,
  },
  {
    materialName: "তোষা কাঁচা পাট বি-বটম (Raw Jute B-Bottom)",
    materialNameEn: "Raw Tosha Jute B-Bottom",
    category: "jute",
    price: 3250.0,
    prevPrice: 3180.0,
    change: 70.0,
    trend: "up",
    unit: "মণ",
    unitEn: "Mon (40KG)",
    marketHub: "বগুড়া, রংপুর ও ফরিদপুর",
    marketHubEn: "Bogra & Faridpur",
    qualityGrade: "প্রিমিয়াম তোষা গোল্ডেন ফাইবার",
    isFeatured: true,
  },
  {
    materialName: "পোর্টল্যান্ড কম্পোজিট সিমেন্ট (PCC)",
    materialNameEn: "Portland Composite Cement (PCC)",
    category: "cement",
    price: 510.0,
    prevPrice: 510.0,
    change: 0.0,
    trend: "stable",
    unit: "ব্যাগ",
    unitEn: "Bag (50KG)",
    marketHub: "মেঘনা ঘাট ও মুন্সিগঞ্জ",
    marketHubEn: "Meghna Ghat, Munshiganj",
    qualityGrade: "বিএসটিআই মানসম্মত ৫০ কেজি ব্যাগ",
    isFeatured: true,
  },
  {
    materialName: "কস্টিক সোডা ফ্লেক্স ৯৮% (Caustic Soda)",
    materialNameEn: "Caustic Soda Flakes 98%",
    category: "chemical",
    price: 62.0,
    prevPrice: 63.0,
    change: -1.0,
    trend: "down",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "খাতুনগঞ্জ, চট্টগ্রাম",
    marketHubEn: "Khatunganj, Chittagong",
    qualityGrade: "শিল্প টেক্সটাইল গ্রেড",
    isFeatured: true,
  },
  {
    materialName: "অ্যালুমিনিয়াম ইনগট ৯৯.৭% (Aluminium)",
    materialNameEn: "Aluminium Ingot 99.7%",
    category: "steel",
    price: 265.0,
    prevPrice: 263.0,
    change: 2.0,
    trend: "up",
    unit: "কেজি",
    unitEn: "KG",
    marketHub: "তেজগাঁও ও ডেমরা, ঢাকা",
    marketHubEn: "Tejgaon & Demra, Dhaka",
    qualityGrade: "হাই পিউরিটি কাস্টিং ইনগট",
    isFeatured: false,
  },
];

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }

    let rates = await MarketRate.find(query).sort({ updatedAt: -1 }).lean();

    // If no rates in DB, seed with initial realistic rates
    if (!rates || rates.length === 0) {
      const count = await MarketRate.countDocuments();
      if (count === 0) {
        await MarketRate.insertMany(INITIAL_RATES);
        rates = await MarketRate.find(query).sort({ updatedAt: -1 }).lean();
      } else {
        rates = INITIAL_RATES;
      }
    }

    const response = NextResponse.json(
      {
        success: true,
        rates: rates && rates.length > 0 ? rates : INITIAL_RATES,
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    );

    // Cache for 60 seconds
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');
    return response;
  } catch (error) {
    console.error('Market rates API error:', error);
    // Fallback to static initial rates if DB has any temporary issue
    return NextResponse.json(
      {
        success: true,
        rates: INITIAL_RATES,
        lastUpdated: new Date().toISOString(),
        isFallback: true,
      },
      { status: 200 }
    );
  }
}
