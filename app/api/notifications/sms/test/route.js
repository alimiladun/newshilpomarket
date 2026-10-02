import { NextResponse } from 'next/server';
import { sendSMS, normalizeBDPhone } from '@/lib/sms';

// POST - Send a test SMS
export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: 'Mobile number is required'
      }, { status: 400 });
    }

    const { isValid, international, local } = normalizeBDPhone(phone);
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Bangladeshi mobile number. Must be 11 digits (e.g. 01712345678)'
      }, { status: 400 });
    }

    const defaultMsg = message || `শিল্পমার্কেট: এটি একটি পরীক্ষামূলক টেস্ট SMS অ্যালার্ট। আপনার অ্যাকাউন্ট সক্রিয় রয়েছে। হটলাইন: ০১৪০১-৬৫৮৬৮৫`;

    const result = await sendSMS({
      to: phone,
      message: defaultMsg,
      title: 'টেস্ট SMS অ্যালার্ট 🧪',
      type: 'general',
      actionUrl: '/buyer/dashboard'
    });

    return NextResponse.json({
      success: true,
      message: `SMS dispatched to ${local} (${result.smsStatus})`,
      data: result
    }, { status: 200 });

  } catch (error) {
    console.error('Test SMS error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}
