import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Buyer from '@/models/Buyer';
import { generateToken, generateRefreshToken } from '@/lib/tokenUtils';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      confirmPassword,
      companyName,
      tradeLicense,
      companyType,
      industry,
      website,
      employeeCount,
      annualRevenueRange,
      address,
    } = body;

    // ── Validate required fields (phone is primary, email is optional) ──
    if (!firstName || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'নাম, মোবাইল নম্বর এবং পাসওয়ার্ড দিন | Name, phone and password are required' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'পাসওয়ার্ড মিলছে না | Passwords do not match' },
        { status: 400 }
      );
    }

    // ── Duplicate check by phone (and email if provided) ──
    const normalizedPhone = String(phone).replace(/\D/g, '');
    const orConditions = [{ phone: normalizedPhone }];
    if (email) orConditions.push({ email: email.toLowerCase() });

    const existing = await Buyer.findOne({ $or: orConditions });
    if (existing) {
      const byPhone = existing.phone === normalizedPhone;
      return NextResponse.json(
        {
          success: false,
          message: byPhone
            ? 'এই মোবাইল নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে | Account already exists with this phone number'
            : 'এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে | Account already exists with this email',
        },
        { status: 400 }
      );
    }

    // ── Create buyer ──
    const newBuyerData = {
      firstName,
      lastName: lastName || '-',
      phone: normalizedPhone,
      password,
      companyName: companyName || `${firstName} ${lastName || ''}`.trim(),
      tradeLicense: tradeLicense || undefined,
      companyType: companyType || 'sole_proprietorship',
      industry: industry || 'General Trading',
      website: website || undefined,
      employeeCount: employeeCount || undefined,
      annualRevenueRange: annualRevenueRange || undefined,
      address: address || undefined,
    };
    // Only set email if provided
    if (email) newBuyerData.email = email.toLowerCase();

    const buyer = await Buyer.create(newBuyerData);

    // ── Generate tokens ──
    const token = generateToken(buyer._id, 'buyer');
    const refreshToken = generateRefreshToken(buyer._id, 'buyer');
    buyer.refreshToken = refreshToken;
    await buyer.save();

    const buyerData = buyer.getPublicProfile();

    return NextResponse.json(
      {
        success: true,
        message: 'নিবন্ধন সফল হয়েছে | Buyer registered successfully',
        data: { buyer: buyerData, token, refreshToken },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Buyer signup error:', error);
    // Handle MongoDB duplicate key errors gracefully
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const msg = field === 'phone'
        ? 'এই মোবাইল নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে | Account already exists with this phone number'
        : field === 'email'
        ? 'এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে | Account already exists with this email'
        : 'এই তথ্য দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে | Account already exists';
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'সার্ভার ত্রুটি | Server error during signup',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
