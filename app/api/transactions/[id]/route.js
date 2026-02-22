import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/database';
import Transaction from '../../../../models/Transaction';

// PATCH /api/transactions/[id] - Update transaction status
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate([
      { path: 'buyer', select: 'firstName lastName email companyName' },
      { path: 'seller', select: 'firstName lastName email companyName' },
      { path: 'product', select: 'name slug primaryImage' },
      { path: 'order', select: 'orderNumber status' }
    ]);

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction status updated successfully'
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update transaction', error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/transactions/[id] - Get single transaction
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const transaction = await Transaction.findById(id)
      .populate('buyer', 'firstName lastName email companyName')
      .populate('seller', 'firstName lastName email companyName')
      .populate('product', 'name slug primaryImage price')
      .populate('order', 'orderNumber status totalAmount');

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transaction', error: error.message },
      { status: 500 }
    );
  }
}
