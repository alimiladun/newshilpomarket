import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Supplier from '@/models/Supplier';
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

    // Find supplier by phone or email
    const normalizedPhone = String(identifier).replace(/\D/g, '');
    const isPhoneLike = /^\d{10,15}$/.test(normalizedPhone) && !identifier.includes('@');

    let supplier;
    if (isPhoneLike) {
      supplier = await Supplier.findOne({ phone: normalizedPhone }).select('+password');
    } else {
      supplier = await Supplier.findOne({ email: identifier.toLowerCase() }).select('+password');
    }

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল | Invalid phone/email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await supplier.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'মোবাইল নম্বর বা পাসওয়ার্ড ভুল | Invalid phone/email or password' },
        { status: 401 }
      );
    }

    // Check account active
    if (!supplier.isActive) {
      return NextResponse.json(
        { success: false, message: 'অ্যাকাউন্ট নিষ্ক্রিয় | Account is deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Generate tokens
    const token = generateToken(supplier._id, 'supplier');
    const refreshToken = generateRefreshToken(supplier._id, 'supplier');

    supplier.lastLogin = Date.now();
    supplier.refreshToken = refreshToken;
    await supplier.save();

    const supplierData = supplier.getPublicProfile();

    return NextResponse.json(
      {
        success: true,
        message: 'লগইন সফল হয়েছে | Login successful',
        data: { supplier: supplierData, token, refreshToken },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Supplier login error:', error);
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
