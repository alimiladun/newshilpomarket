import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/tokenUtils';

// PUT - Buyer accepts or rejects quote
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
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
        message: 'Invalid or expired session'
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, quoteAccepted } = body;

    // Find the order and verify it belongs to this buyer
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    if (order.buyer.toString() !== decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to modify this order'
      }, { status: 403 });
    }

    // Handle quote response
    if (action === 'quote_response') {
      if (order.orderStatus !== 'quote_sent') {
        return NextResponse.json({
          success: false,
          message: 'No active quote to respond to'
        }, { status: 400 });
      }

      if (quoteAccepted) {
        // Buyer accepts quote - waiting for supplier to confirm
        order.orderStatus = 'confirmed';
        order.confirmedAt = new Date();
        // Update total amount to quote amount if quote was sent
        if (order.quoteDetails?.quoteAmount) {
          order.totalAmount = order.quoteDetails.quoteAmount;
        }
      } else {
        // Buyer rejects quote
        order.orderStatus = 'rejected';
        order.cancelledAt = new Date();
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('product', 'name images primaryImage')
      .populate('buyer', 'companyName firstName lastName email phone')
      .populate('supplier', 'companyName firstName lastName email');

    return NextResponse.json({
      success: true,
      message: quoteAccepted ? 'Quote accepted successfully' : 'Quote rejected',
      order: updatedOrder
    }, { status: 200 });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}
