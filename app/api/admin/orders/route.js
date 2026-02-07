import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/tokenUtils';

// GET - Fetch all orders (admin only)
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('Admin orders: No token provided');
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Admin orders: Token decoded:', { id: decoded?.id, type: decoded?.type });
    
    if (!decoded || decoded.type !== 'admin') {
      console.log('Admin orders: Access denied - not admin');
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    let query = {};
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    console.log('Admin orders: Query:', query, 'Skip:', skip, 'Limit:', limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('product', 'name images primaryImage category unit')
        .populate('buyer', 'companyName firstName lastName email phone')
        .populate('supplier', 'companyName firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    console.log('Admin orders: Found', orders.length, 'orders out of', total, 'total');

    // Get statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const response = {
      success: true,
      orders,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };

    console.log('Admin orders: Returning response with', orders.length, 'orders and stats:', response.stats);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}
