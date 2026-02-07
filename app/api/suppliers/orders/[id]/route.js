import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/tokenUtils';

// PUT - Update order status or send quote (supplier only)
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
    if (!decoded || decoded.type !== 'supplier') {
      return NextResponse.json({
        success: false,
        message: 'Supplier access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, orderStatus, quoteDetails, trackingNumber } = body;

    // Find the order and verify it belongs to this supplier
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    if (order.supplier.toString() !== decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to modify this order'
      }, { status: 403 });
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
      const validTransitions = {
        'pending': ['quote_sent', 'confirmed', 'rejected'],
        'quote_sent': ['confirmed', 'rejected'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipping', 'cancelled'],
        'shipping': ['delivered', 'cancelled'],
        'delivered': [],
        'cancelled': [],
        'rejected': []
      };

      if (!validTransitions[order.orderStatus]?.includes(orderStatus)) {
        return NextResponse.json({
          success: false,
          message: `Cannot transition from ${order.orderStatus} to ${orderStatus}`
        }, { status: 400 });
      }

      order.orderStatus = orderStatus;

      // Update timestamps based on status
      if (orderStatus === 'confirmed') {
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
