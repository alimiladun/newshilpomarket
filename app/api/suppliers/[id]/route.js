import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Supplier from '@/models/Supplier';
import Product from '@/models/Product';

// GET - Fetch single supplier by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    console.log('Fetching supplier with ID:', id);
    
    const supplier = await Supplier.findById(id)
      .select('-password -refreshToken')
      .lean();

    console.log('Supplier found:', supplier ? 'Yes' : 'No');

    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: 'Supplier not found'
      }, { status: 404 });
    }

    // Get supplier's products
    const products = await Product.find({ 
      supplier: id, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get statistics
    const totalProducts = products.length;
    const totalOrders = Math.floor(Math.random() * 10000) + 1000; // Mock for now
    const rating = 4.5 + Math.random() * 0.5;
    const reviews = Math.floor(Math.random() * 1000) + 100;

    const supplierData = {
      ...supplier,
      products,
      stats: {
        totalProducts,
        totalOrders,
        rating,
        reviews,
        responseTime: '< 2 hours',
        established: supplier.createdAt ? new Date(supplier.createdAt).getFullYear() : new Date().getFullYear(),
        employees: supplier.employeeCount || '50-100',
        verified: supplier.isVerified || supplier.isApproved
      }
    };

    return NextResponse.json({
      success: true,
      supplier: supplierData
    }, { status: 200 });

  } catch (error) {
    console.error('Get supplier error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
