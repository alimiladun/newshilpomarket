import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import RFQ from '@/models/RFQ';
import Supplier from '@/models/Supplier';
import { verifyToken } from '@/lib/tokenUtils';
import { notifyRFQQuoteSMS } from '@/lib/sms';

// POST - Supplier submits quote on an RFQ
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required. Please log in as a supplier to submit a quote.'
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

    if (rfq.status !== 'open') {
      return NextResponse.json({
        success: false,
        message: 'This RFQ is no longer accepting new quotes.'
      }, { status: 400 });
    }

    // Disallow buyer from quoting on their own RFQ
    if (rfq.buyer.toString() === decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'You cannot submit a quote on your own RFQ.'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      offeredPrice,
      minOrderQuantity = 1,
      deliveryDays = 2,
      transportIncluded = false,
      notes = '',
      supplierName,
      supplierCompany,
      supplierPhone
    } = body;

    if (!offeredPrice || isNaN(Number(offeredPrice))) {
      return NextResponse.json({
        success: false,
        message: 'Please provide a valid offered price per unit.'
      }, { status: 400 });
    }

    // Fetch supplier info if available
    let sName = supplierName || decoded.name || 'সরবরাহকারী';
    let sCompany = supplierCompany || decoded.companyName || '';
    let sPhone = supplierPhone || decoded.phone || '';

    if (!sPhone) {
      const supplierDoc = await Supplier.findById(decoded.id).select('firstName lastName companyName phone');
      if (supplierDoc) {
        sName = `${supplierDoc.firstName || ''} ${supplierDoc.lastName || ''}`.trim() || supplierDoc.companyName || sName;
        sCompany = supplierDoc.companyName || sCompany;
        sPhone = supplierDoc.phone || sPhone;
      }
    }

    // Check if supplier already submitted a quote
    const existingIndex = rfq.quotes.findIndex(q => q.supplier.toString() === decoded.id);

    const quoteObj = {
      supplier: decoded.id,
      supplierName: sName,
      supplierCompany: sCompany,
      supplierPhone: sPhone,
      offeredPrice: Number(offeredPrice),
      minOrderQuantity: Number(minOrderQuantity) || 1,
      deliveryDays: Number(deliveryDays) || 2,
      transportIncluded: Boolean(transportIncluded),
      notes: notes.trim(),
      status: 'pending',
      createdAt: new Date()
    };

    if (existingIndex >= 0) {
      // Update existing quote
      rfq.quotes[existingIndex] = quoteObj;
    } else {
      // Add new quote
      rfq.quotes.push(quoteObj);
    }

    await rfq.save();

    // Dispatch real-time SMS to Buyer (non-blocking)
    try {
      notifyRFQQuoteSMS({
        rfq,
        quote: quoteObj,
        buyerPhone: rfq.contactPhone
      }).catch(err => console.error('RFQ Quote SMS notification error:', err));
    } catch (smsErr) {
      console.error('Trigger RFQ Quote SMS error:', smsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Quote submitted successfully!',
      quote: quoteObj,
      totalQuotesCount: rfq.quotes.length
    }, { status: 201 });

  } catch (error) {
    console.error('Submit RFQ quote error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to submit quote'
    }, { status: 500 });
  }
}
