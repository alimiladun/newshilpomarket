import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/tokenUtils';

// GET - Fetch buyer's orders
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
    if (!decoded || decoded.type !== 'buyer') {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    let query = { buyer: decoded.id };
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('product', 'name images primaryImage category')
        .populate('supplier', 'companyName firstName lastName email phone profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}

// POST - Create new order
export async function POST(request) {
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
    if (!decoded || decoded.type !== 'buyer') {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity, deliveryAddress, billingAddress, paymentMethod, specialRequirements, urgentDelivery, insurance } = body;

    // Validate required fields
    if (!productId || !quantity || !deliveryAddress || !paymentMethod) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Get product details
    const product = await Product.findById(productId)
      .populate('supplier', '_id')
      .lean();

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Product is not available'
      }, { status: 400 });
    }

    // Validate quantity
    if (quantity < product.minOrder) {
      return NextResponse.json({
        success: false,
        message: `Minimum order quantity is ${product.minOrder}`
      }, { status: 400 });
    }

    // Calculate costs
    const unitPrice = product.price;
    const subtotal = quantity * unitPrice;
    const shippingCost = urgentDelivery ? 500 : 200;
    const insuranceCost = insurance ? subtotal * 0.02 : 0;
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + shippingCost + insuranceCost + tax;

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(6, '0')}`;

    // Create order
    const order = new Order({
      orderNumber,
      buyer: decoded.id,
      supplier: product.supplier._id || product.supplier,
      product: productId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        unit: product.unit,
        images: product.images?.map(img => img.url) || [],
        category: product.category
      },
      quantity,
      unitPrice,
      subtotal,
      shippingCost,
      insuranceCost,
      tax,
      totalAmount,
      deliveryAddress,
      billingAddress: billingAddress || deliveryAddress,
      urgentDelivery: urgentDelivery || false,
      insurance: insurance || false,
      paymentMethod,
      specialRequirements: specialRequirements || '',
      orderStatus: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Populate order for response
    await order.populate([
      { path: 'product', select: 'name images primaryImage category' },
      { path: 'supplier', select: 'companyName firstName lastName email phone' }
    ]);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create order'
    }, { status: 500 });
  }
}
