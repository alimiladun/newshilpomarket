import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import AssistedTrade from '@/models/AssistedTrade';
import { notifyAssistedTradeSMS } from '@/lib/sms';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      buyerName,
      phone,
      materialNeeded,
      approxQuantity,
      targetLocation,
      notes,
    } = body;

    if (!buyerName || !phone || !materialNeeded) {
      return NextResponse.json(
        { success: false, error: 'নাম, মোবাইল নম্বর ও কাঁচামালের বিবরণ আবশ্যক' },
        { status: 400 }
      );
    }

    const trade = await AssistedTrade.create({
      buyerName: buyerName.trim(),
      phone: phone.trim(),
      materialNeeded: materialNeeded.trim(),
      approxQuantity: approxQuantity || '১০+ টন',
      targetLocation: targetLocation || 'ঢাকা',
      notes: notes || '',
      status: 'pending',
    });

    // Send SMS confirmation (non-blocking)
    try {
      notifyAssistedTradeSMS({
        tradeRequest: {
          phone: trade.phone,
          category: trade.materialNeeded,
          estimatedVolume: trade.approxQuantity
        }
      }).catch(err => console.error('Assisted trade SMS error:', err));
    } catch (smsErr) {
      console.error('Trigger Assisted Trade SMS error:', smsErr);
    }

    return NextResponse.json(
      {
        success: true,
        tradeId: trade._id,
        message: 'শিল্পমার্কেট ট্রেড ডেস্কে আপনার অনুরোধ গৃহীত হয়েছে। আমাদের প্রতিনিধি ৩০ মিনিটের মধ্যে আপনাকে কল করবে।',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assisted trade error:', error);
    return NextResponse.json(
      { success: false, error: 'অনুরোধ সংরক্ষণ করা যায়নি। অনুগ্রহ করে হটলাইনে কল করুন।' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const trades = await AssistedTrade.find().sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ success: true, trades }, { status: 200 });
  } catch (error) {
    console.error('Fetch assisted trades error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
