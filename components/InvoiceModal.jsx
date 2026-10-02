"use client"

import { Printer, Download, X, Building2, CheckCircle2 } from "lucide-react"

export default function InvoiceModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isBn = true; // standard BD wholesale invoice format

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">📄 B2B চালান ও ভাউচার (Delivery Challan)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট / PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice / Challan Body */}
        <div id="printable-challan" className="p-8 bg-white text-slate-800 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-blue-900 tracking-tight">শিল্পমার্কেট</span>
                <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">B2B পাইকারি প্ল্যাটফর্ম</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">কাঁচামালের ডিজিটাল মার্কেটপ্লেস ও ট্রেড এসক্রো</p>
              <p className="text-xs text-slate-500">হটলাইন: ০১৪০১-৬৫৮৬৮৫ | shilpomarket.com</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black uppercase text-slate-800 tracking-wider">ডেলিভারি চালান ও মেমো</span>
              <p className="font-mono text-sm font-bold text-blue-700 mt-1">#{order.orderNumber}</p>
              <p className="text-xs text-slate-500">
                তারিখ: {new Date(order.createdAt || Date.now()).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Parties: Buyer & Supplier */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">সরবরাহকারী (সেলার):</span>
              <p className="font-extrabold text-sm text-slate-900">{order.supplier?.companyName || 'যাচাইকৃত সরবরাহকারী'}</p>
              <p className="text-slate-600 mt-0.5">{order.supplier?.firstName} {order.supplier?.lastName}</p>
              <p className="text-slate-600">ফোন: {order.supplier?.phone || '০১৪০১-XXXXXX'}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">প্রাপক / ক্রেতা (বায়ার):</span>
              <p className="font-extrabold text-sm text-slate-900">{order.buyer?.companyName || order.buyer?.firstName || 'শিল্পমার্কেট ক্রেতা'}</p>
              <p className="text-slate-600 mt-0.5">ঠিকানা: {order.deliveryAddress || 'কারখানা ডেলিভারি'}</p>
              <p className="text-slate-600">মোবাইল: {order.contactPhone || order.buyer?.phone || '০১৭XXXXXXXX'}</p>
            </div>
          </div>

          {/* Material Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-2.5 rounded-l-lg">ক্রম</th>
                <th className="p-2.5">কাঁচামালের বিবরণ ও গ্রেড</th>
                <th className="p-2.5 text-center">পরিমাণ</th>
                <th className="p-2.5 text-right">একক দর</th>
                <th className="p-2.5 text-right rounded-r-lg">মোট টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 text-slate-500">১</td>
                <td className="p-2.5 font-bold text-slate-900">
                  {order.productSnapshot?.name || order.product?.name}
                  {order.specialRequirements && (
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">নোট: {order.specialRequirements}</span>
                  )}
                </td>
                <td className="p-2.5 text-center font-bold">
                  {order.quantity} {order.productSnapshot?.unit || order.product?.unit || 'কেজি'}
                </td>
                <td className="p-2.5 text-right font-medium">৳{order.unitPrice?.toLocaleString()}</td>
                <td className="p-2.5 text-right font-bold">৳{order.subtotal?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Cost Totals Breakdown */}
          <div className="flex justify-between items-start pt-2">
            <div className="text-xs text-slate-500 space-y-1 max-w-xs">
              <p><strong>ডেলিভারি ধরন:</strong> {order.deliveryType === 'buyer_pickup' ? 'মিল গেট থেকে নিজস্ব পিকআপ' : 'ট্রাক পরিবহন ডেলিভারি'}</p>
              <p><strong>পেমেন্ট মেথড:</strong> {order.paymentMethod?.replace('_', ' ').toUpperCase()}</p>
              {order.paymentDetails?.trxId && (
                <p><strong>TrxID:</strong> {order.paymentDetails.trxId}</p>
              )}
            </div>

            <div className="w-56 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>পণ্য মূল্য:</span>
                <span className="font-semibold">৳{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>পরিবহন খরচ:</span>
                <span className="font-semibold">{order.shippingCost === 0 ? '৳০ (ফ্রি)' : `৳${order.shippingCost?.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-300 pt-2">
                <span>সর্বমোট বিল:</span>
                <span className="text-blue-900">৳{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-3 gap-4 pt-12 text-center text-xs text-slate-500 border-t border-slate-200 mt-8">
            <div>
              <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1"></div>
              <span>ট্রাক চালক / পরিবহন স্বাক্ষর</span>
            </div>
            <div>
              <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1"></div>
              <span>স্টোর কিপার / আনলোড গ্রহণকারী</span>
            </div>
            <div>
              <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1"></div>
              <span className="font-bold text-slate-800">শিল্পমার্কেট অনুমোদিত সিল</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
