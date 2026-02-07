import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/tokenUtils';

// PUT - Update order status or send quote (admin)
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
    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, orderStatus, quoteDetails, trackingNumber, adminNotes } = body;

    // Find the order
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // Handle different actions
    if (action === 'send_quote') {
      order.quoteDetails = {
        quoteSent: true,
        quoteSentAt: new Date(),
        quoteAmount: quoteDetails.quoteAmount,
        quoteValidUntil: quoteDetails.quoteValidUntil,
        quoteNotes: quoteDetails.quoteNotes || ''
      };
      order.orderStatus = 'quote_sent';
    } else if (action === 'update_status') {
      // Admin can make any status transition
      order.orderStatus = orderStatus;

      // Update timestamps based on status
      if (orderStatus === 'confirmed' && !order.confirmedAt) {
        order.confirmedAt = new Date();
      } else if (orderStatus === 'shipping') {
        order.shippedAt = new Date();
        if (trackingNumber) {
          order.trackingNumber = trackingNumber;
        }
      } else if (orderStatus === 'delivered') {
        order.deliveredAt = new Date();
        order.actualDelivery = new Date();
      } else if (orderStatus === 'cancelled' || orderStatus === 'rejected') {
        order.cancelledAt = new Date();
      }
    } else if (action === 'add_tracking') {
      order.trackingNumber = trackingNumber;
    } else if (action === 'add_notes') {
      order.adminNotes = adminNotes;
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('product', 'name images primaryImage')
      .populate('buyer', 'companyName firstName lastName email phone')
      .populate('supplier', 'companyName firstName lastName email');

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
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
