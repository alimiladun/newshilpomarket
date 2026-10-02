"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/buyer/dashboard?mode=seller');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-semibold text-sm">ট্রেডার ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    </div>
  );
}