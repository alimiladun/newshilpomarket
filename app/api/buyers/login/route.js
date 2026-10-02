import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Buyer from '@/models/Buyer';
import { generateToken, generateRefreshToken } from '@/lib/tokenUtils';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, phone, password, phoneOrEmail, identifier: idInput } = body;

    // Accept phone, email, phoneOrEmail, or identifier
    const identifier = phone || email || phoneOrEmail || idInput;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড দিন | Phone/email and password are required' },
        { status: 400 }
      );
    }

    // Find buyer by phone or email
    const normalizedPhone = String(identifier).replace(/\D/g, '');
    const isPhoneLike = /^\d{10,15}$/.test(normalizedPhone) && !identifier.includes('@');

    let buyer;
    if (isPhoneLike) {
      buyer = await Buyer.findOne({ phone: normalizedPhone }).select('+password');
    } else {
      buyer = await Buyer.findOne({ email: identifier.toLowerCase() }).select('+password');
    }

    if (!buyer) {
      return NextResponse.json(
        { success: false, message: 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল | Invalid phone/email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await buyer.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল | Invalid phone/email or password' },
        { status: 401 }
      );
    }

    // Check account active
    if (!buyer.isActive) {
      return NextResponse.json(
        { success: false, message: 'অ্যাকাউন্ট নিষ্ক্রিয় | Account is deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Generate tokens
    const token = generateToken(buyer._id, 'buyer');
    const refreshToken = generateRefreshToken(buyer._id, 'buyer');

    buyer.lastLogin = Date.now();
    buyer.refreshToken = refreshToken;
    await buyer.save();

    const buyerData = buyer.getPublicProfile();

    return NextResponse.json(
      {
        success: true,
        message: 'লগইন সফল হয়েছে | Login successful',
        data: { buyer: buyerData, token, refreshToken },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Buyer login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'সার্ভার ত্রুটি | Server error during login',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
