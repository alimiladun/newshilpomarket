import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import RFQ from '@/models/RFQ';
import { verifyToken } from '@/lib/tokenUtils';

// GET - Single RFQ details
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const rfq = await RFQ.findById(id);
    if (!rfq) {
      return NextResponse.json({
        success: false,
        message: 'RFQ not found'
      }, { status: 404 });
    }

    // Increment view count
    rfq.views = (rfq.views || 0) + 1;
    await rfq.save();

    // Check who is requesting
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    let isOwner = false;
    let userId = null;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id;
        if (rfq.buyer.toString() === decoded.id) {
          isOwner = true;
        }
      }
    }

    // Prepare quotes visibility
    let quotesToReturn = [];
    if (isOwner) {
      // Owner sees all submitted quotes
      quotesToReturn = rfq.quotes || [];
    } else if (userId) {
      // Suppliers see only their own quote, plus count
      quotesToReturn = (rfq.quotes || []).filter(q => q.supplier.toString() === userId);
    }

    return NextResponse.json({
      success: true,
      rfq: {
        ...rfq.toObject(),
        quotes: quotesToReturn,
        totalQuotesCount: rfq.quotes ? rfq.quotes.length : 0,
        isOwner
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get single RFQ error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}

// PUT - Update RFQ status (close, award, or accept a quote)
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
        message: 'Invalid session'
      }, { status: 401 });
    }

    const rfq = await RFQ.findById(id);
    if (!rfq) {
      return NextResponse.json({
        success: false,
        message: 'RFQ not found'
      }, { status: 404 });
    }

    if (rfq.buyer.toString() !== decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized: Only the creator can modify this RFQ'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, quoteId, status } = body;

    if (action === 'accept_quote' && quoteId) {
      const quote = rfq.quotes.id(quoteId);
      if (quote) {
        quote.status = 'accepted';
        rfq.status = 'awarded';
      }
    } else if (status) {
      rfq.status = status;
    }

    await rfq.save();

    return NextResponse.json({
      success: true,
      message: 'RFQ updated successfully',
      rfq
    }, { status: 200 });

  } catch (error) {
    console.error('Update RFQ error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}
