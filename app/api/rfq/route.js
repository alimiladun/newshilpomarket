import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import RFQ from '@/models/RFQ';
import { verifyToken } from '@/lib/tokenUtils';

// GET - List RFQs with optional filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const status = searchParams.get('status') || 'open';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }
    if (district && district !== 'all') {
      query.deliveryDistrict = { $regex: new RegExp(district, 'i') };
    }
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } },
        { deliveryDistrict: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const skip = (page - 1) * limit;

    const [rfqs, total] = await Promise.all([
      RFQ.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RFQ.countDocuments(query)
    ]);

    // Format RFQs and quote count
    const sanitizedRfqs = rfqs.map(rfq => ({
      _id: rfq._id,
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      category: rfq.category,
      quantity: rfq.quantity,
      unit: rfq.unit,
      targetPrice: rfq.targetPrice,
      buyerName: rfq.buyerName,
      buyerCompany: rfq.buyerCompany,
      buyerPhone: rfq.buyerPhone,
      deliveryDistrict: rfq.deliveryDistrict,
      deliveryAddress: rfq.deliveryAddress,
      deadlineDays: rfq.deadlineDays,
      urgency: rfq.urgency,
      description: rfq.description,
      status: rfq.status,
      quoteCount: rfq.quotes ? rfq.quotes.length : 0,
      views: rfq.views || 0,
      createdAt: rfq.createdAt,
      expiresAt: rfq.expiresAt
    }));

    return NextResponse.json({
      success: true,
      rfqs: sanitizedRfqs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch RFQs error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error fetching RFQs'
    }, { status: 500 });
  }
}

// POST - Create a new RFQ (tender request)
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required. Please log in to post an RFQ.'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      category,
      quantity,
      unit = 'টন',
      targetPrice = 0,
      deliveryDistrict,
      deliveryAddress = '',
      deadlineDays = 7,
      urgency = 'standard',
      description = '',
      contactPhone,
      buyerName,
      buyerCompany
    } = body;

    // Validate required fields
    if (!title || !category || !quantity || !deliveryDistrict) {
      return NextResponse.json({
        success: false,
        message: 'Please provide Title, Category, Quantity, and Delivery District.'
      }, { status: 400 });
    }

    const buyerModel = decoded.type === 'supplier' ? 'Supplier' : 'Buyer';
    const finalPhone = contactPhone || decoded.phone || '';
    const finalName = buyerName || decoded.name || decoded.companyName || 'শিল্পমার্কেট মার্চেন্ট';

    const rfqCount = await RFQ.countDocuments();
    const rfqNumber = `RFQ-${Date.now().toString().slice(-6)}-${(rfqCount + 1).toString().padStart(4, '0')}`;
    const expiresAt = new Date(Date.now() + (Number(deadlineDays) || 7) * 24 * 60 * 60 * 1000);

    const rfq = new RFQ({
      rfqNumber,
      title: title.trim(),
      category: category.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      targetPrice: Number(targetPrice) || 0,
      buyer: decoded.id,
      buyerModel,
      buyerName: finalName,
      buyerCompany: buyerCompany || decoded.companyName || '',
      buyerPhone: finalPhone,
      deliveryDistrict: deliveryDistrict.trim(),
      deliveryAddress: deliveryAddress.trim(),
      deadlineDays: Number(deadlineDays) || 7,
      expiresAt,
      urgency,
      description: description.trim(),
      status: 'open',
      quotes: []
    });

    await rfq.save();

    return NextResponse.json({
      success: true,
      message: 'RFQ posted successfully!',
      rfq
    }, { status: 201 });

  } catch (error) {
    console.error('Create RFQ error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to post RFQ'
    }, { status: 500 });
  }
}
