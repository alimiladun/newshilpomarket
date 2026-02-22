import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/database';
import Transaction from '../../../models/Transaction';
import { verifyToken } from '../../../lib/tokenUtils';

// GET /api/transactions - Get transactions based on user type
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType'); // 'buyer', 'seller', 'admin'
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Build query based on user type
    let query = {};

    if (userType === 'buyer' && userId) {
      query.buyer = userId;
    } else if (userType === 'seller' && userId) {
      query.seller = userId;
    } else if (userType !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Add additional filters
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    // Fetch transactions with populated references
    const transactions = await Transaction.find(query)
      .populate('buyer', 'firstName lastName email companyName')
      .populate('seller', 'firstName lastName email companyName')
      .populate('product', 'name slug primaryImage')
      .populate('order', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Calculate stats
    const stats = await calculateStats(query);

    return NextResponse.json({
      success: true,
      transactions,
      stats,
      count: transactions.length
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      orderId,
      buyerId,
      sellerId,
      productId,
      type,
      amount,
      platformCommission = 0,
      paymentMethod,
      description,
      metadata
    } = body;

    // Validate required fields
    if (!buyerId || !sellerId || !type || !amount || !paymentMethod || !description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate net amount
    const netAmount = type === 'payment' ? amount - platformCommission : amount;

    // Create transaction
    const transaction = await Transaction.create({
      order: orderId,
      buyer: buyerId,
      seller: sellerId,
      product: productId,
      type,
      amount,
      platformCommission,
      netAmount,
      paymentMethod,
      description,
      metadata,
      status: type === 'refund' ? 'completed' : 'pending'
    });

    // Populate references
    await transaction.populate([
      { path: 'buyer', select: 'firstName lastName email companyName' },
      { path: 'seller', select: 'firstName lastName email companyName' },
      { path: 'product', select: 'name slug primaryImage' },
      { path: 'order', select: 'orderNumber status' }
    ]);

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create transaction', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate statistics
async function calculateStats(query) {
  const completedQuery = { ...query, status: 'completed' };
  const pendingQuery = { ...query, status: 'pending' };

  const [completed, pending, all] = await Promise.all([
    Transaction.find(completedQuery),
    Transaction.find(pendingQuery),
    Transaction.find(query)
  ]);

  const totalIncome = completed
    .filter(t => t.type === 'payment' || t.type === 'payout')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = completed
    .filter(t => t.type === 'commission' || t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = pending
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommission = completed
    .reduce((sum, t) => sum + (t.platformCommission || 0), 0);

  return {
    totalIncome,
    totalExpenses,
    pendingAmount,
    totalCommission,
    totalTransactions: all.length,
    completedTransactions: completed.length,
    pendingTransactions: pending.length
  };
}
