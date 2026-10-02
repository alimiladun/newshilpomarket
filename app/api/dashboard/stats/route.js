import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';
import RFQ from '@/models/RFQ';
import Transaction from '@/models/Transaction';
import { verifyToken } from '@/lib/tokenUtils';

export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid session'
      }, { status: 401 });
    }

    const userId = decoded.id;

    // 1. Fetch Buyer Statistics (Real DB)
    const [
      buyerOrdersCount,
      buyerPendingOrders,
      buyerDeliveredOrders,
      buyerRfqsCount,
      buyerOrdersAgg,
      recentBuyerOrders
    ] = await Promise.all([
      Order.countDocuments({ buyer: userId }),
      Order.countDocuments({ buyer: userId, orderStatus: { $in: ['pending', 'quote_sent', 'confirmed', 'processing', 'shipping'] } }),
      Order.countDocuments({ buyer: userId, orderStatus: 'delivered' }),
      RFQ.countDocuments({ buyer: userId }),
      Order.aggregate([
        { $match: { buyer: new (require('mongoose').Types.ObjectId)(userId), orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } }
      ]),
      Order.find({ buyer: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('product', 'name images primaryImage unit price')
        .populate('supplier', 'companyName firstName lastName phone')
        .lean()
    ]);

    const buyerTotalSpent = buyerOrdersAgg[0]?.totalSpent || 0;

    // 2. Fetch Seller Statistics (Real DB)
    const [
      sellerOrdersCount,
      sellerPendingOrders,
      sellerDeliveredOrders,
      sellerProductsCount,
      sellerRevenueAgg,
      recentSellerOrders,
      myProducts
    ] = await Promise.all([
      Order.countDocuments({ supplier: userId }),
      Order.countDocuments({ supplier: userId, orderStatus: { $in: ['pending', 'quote_sent', 'confirmed', 'processing', 'shipping'] } }),
      Order.countDocuments({ supplier: userId, orderStatus: 'delivered' }),
      Product.countDocuments({ supplier: userId, isActive: true }),
      Order.aggregate([
        { $match: { supplier: new (require('mongoose').Types.ObjectId)(userId), orderStatus: { $in: ['confirmed', 'processing', 'shipping', 'delivered'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Order.find({ supplier: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('product', 'name images primaryImage unit price')
        .populate('buyer', 'companyName firstName lastName phone')
        .lean(),
      Product.find({ supplier: userId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name price unit inStock category views images primaryImage')
        .lean()
    ]);

    const sellerRevenue = sellerRevenueAgg[0]?.totalRevenue || 0;

    return NextResponse.json({
      success: true,
      buyer: {
        totalOrders: buyerOrdersCount,
        pendingOrders: buyerPendingOrders,
        deliveredOrders: buyerDeliveredOrders,
        totalSpent: buyerTotalSpent,
        totalRfqs: buyerRfqsCount,
        recentOrders: recentBuyerOrders
      },
      seller: {
        totalOrders: sellerOrdersCount,
        pendingOrders: sellerPendingOrders,
        deliveredOrders: sellerDeliveredOrders,
        productsListed: sellerProductsCount,
        revenue: sellerRevenue,
        recentOrders: recentSellerOrders,
        recentProducts: myProducts
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}
