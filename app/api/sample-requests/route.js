import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import SampleRequest from '@/models/SampleRequest';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      productId,
      productName,
      supplierName,
      supplierPhone,
      buyerName,
      buyerPhone,
      deliveryAddress,
      sampleQuantity,
    } = body;

    if (!buyerName || !buyerPhone || !deliveryAddress || !productName) {
      return NextResponse.json(
        { success: false, error: 'নাম, মোবাইল নম্বর, পণ্যের নাম এবং ডেলিভারি ঠিকানা আবশ্যক' },
        { status: 400 }
      );
    }

    const sampleReq = await SampleRequest.create({
      productId: productId || null,
      productName: productName.trim(),
      supplierName: supplierName || 'প্রস্তুতকারক',
      supplierPhone: supplierPhone || '',
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      sampleQuantity: sampleQuantity || '১-২ কেজি টেস্ট নমুনা',
      status: 'requested',
    });

    return NextResponse.json(
      {
        success: true,
        requestId: sampleReq._id,
        message: 'নমুনা পাঠানোর অনুরোধ সফলভাবে পাঠানো হয়েছে। বিক্রেতা আপনার সাথে যোগাযোগ করবেন।',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sample request error:', error);
    return NextResponse.json(
      { success: false, error: 'অনুরোধ সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const requests = await SampleRequest.find().sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ success: true, requests }, { status: 200 });
  } catch (error) {
    console.error('Fetch sample requests error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
