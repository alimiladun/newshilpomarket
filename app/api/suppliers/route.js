import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Supplier from '@/models/Supplier';
import Product from '@/models/Product';

// GET - Fetch all suppliers or filter by query
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const verified = searchParams.get('verified');
    const sort = searchParams.get('sort') || '-createdAt';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    let query = { isActive: true, isApproved: true };

    // Search by name, company name, or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category (interested categories)
    if (category && category !== 'all') {
      query.interestedCategories = { $in: [parseInt(category)] };
    }

    // Filter by country/location
    if (country && country !== 'all') {
      query.address = { $regex: country, $options: 'i' };
    }

    // Filter by verified status
    if (verified === 'true') {
      query.isVerified = true;
    }

    const skip = (page - 1) * limit;

    // Sort mapping
    const sortMap = {
      'rating': { rating: -1 },
      'name': { companyName: 1 },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 }
    };

    const sortQuery = sortMap[sort] || { createdAt: -1 };

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .select('-password -refreshToken')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query)
    ]);

    // Get product count for each supplier
    const suppliersWithStats = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({ 
          supplier: supplier._id, 
          isActive: true 
        });
        return {
          ...supplier,
          productsCount: productCount,
          rating: 4.5 + Math.random() * 0.5, // Mock rating for now
          reviews: Math.floor(Math.random() * 1000) + 100,
          responseTime: '< 2 hours',
          totalOrders: `${Math.floor(Math.random() * 10000) + 1000}+`
        };
      })
    );

    return NextResponse.json({
      success: true,
      suppliers: suppliersWithStats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}
