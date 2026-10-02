import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Transaction from '@/models/Transaction';
import { verifyToken } from '@/lib/tokenUtils';
import { notifyNewOrderSMS } from '@/lib/sms';

// GET - Fetch buyer's orders (supports both buyers and suppliers buying inputs)
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
        message: 'Invalid or expired session. Please log in again.'
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
        .populate('product', 'name images primaryImage category unit price')
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

// POST - Create new order (supports both buyers and suppliers purchasing raw materials)
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
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      }, { status: 401 });
    }

    const buyerModel = decoded.type === 'supplier' ? 'Supplier' : 'Buyer';

    const body = await request.json();
    const {
      productId,
      quantity,
      deliveryAddress,
      billingAddress,
      contactPhone,
      deliveryType = 'truck_delivery',
      paymentMethod = 'bank_transfer',
      paymentDetails = {},
      specialRequirements,
      urgentDelivery = false,
      insurance = false,
      shippingCost: clientShippingCost
    } = body;

    // Validate required fields
    if (!productId || !quantity || !deliveryAddress || !paymentMethod) {
      return NextResponse.json({
        success: false,
        message: 'Missing required order details (product, quantity, address, or payment method)'
      }, { status: 400 });
    }

    // Get product details
    const product = await Product.findById(productId)
      .populate('supplier', '_id companyName phone firstName lastName')
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
        message: 'This product is currently inactive or out of stock'
      }, { status: 400 });
    }

    // Validate quantity
    const minOrder = product.minOrder || 1;
    if (quantity < minOrder) {
      return NextResponse.json({
        success: false,
        message: `Minimum order quantity is ${minOrder} ${product.unit || 'units'}`
      }, { status: 400 });
    }

    // Calculate costs (realistic B2B pricing in BDT)
    const unitPrice = product.price;
    const subtotal = Math.round(quantity * unitPrice);
    
    // Delivery calculation: Self-pickup is 0 BDT. Truck delivery defaults to 1,500 - 2,500 BDT or custom
    let shippingCost = 0;
    if (deliveryType === 'truck_delivery') {
      if (clientShippingCost !== undefined && !isNaN(Number(clientShippingCost))) {
        shippingCost = Number(clientShippingCost);
      } else {
        shippingCost = urgentDelivery ? 2500 : 1500;
      }
    }

    const insuranceCost = insurance ? Math.round(subtotal * 0.01) : 0; // 1% transit insurance
    const tax = 0; // standard wholesale raw material VAT is invoice-based
    const totalAmount = subtotal + shippingCost + insuranceCost + tax;

    // Generate unique order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${(orderCount + 1).toString().padStart(4, '0')}`;

    // Determine initial payment status based on method
    let initialPaymentStatus = 'pending';
    if (paymentDetails?.trxId || paymentDetails?.depositSlipUrl) {
      initialPaymentStatus = 'processing';
    }

    // Create order
    const order = new Order({
      orderNumber,
      buyer: decoded.id,
      buyerModel,
      supplier: product.supplier._id || product.supplier,
      product: productId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        unit: product.unit || 'কেজি',
        images: product.images?.map(img => typeof img === 'string' ? img : img.url) || [],
        category: product.category
      },
      quantity,
      unitPrice,
      subtotal,
      deliveryType,
      shippingCost,
      insuranceCost,
      tax,
      totalAmount,
      contactPhone: contactPhone || decoded.phone || '',
      deliveryAddress,
      billingAddress: billingAddress || deliveryAddress,
      urgentDelivery: Boolean(urgentDelivery),
      insurance: Boolean(insurance),
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentDetails: {
        trxId: paymentDetails?.trxId || '',
        senderNumber: paymentDetails?.senderNumber || '',
        bankName: paymentDetails?.bankName || '',
        depositSlipUrl: paymentDetails?.depositSlipUrl || '',
        advanceAmount: paymentDetails?.advanceAmount || (paymentMethod === 'bkash' || paymentMethod === 'nagad' ? Math.round(totalAmount * 0.1) : 0),
        dueAmount: paymentDetails?.dueAmount || totalAmount
      },
      specialRequirements: specialRequirements || '',
      orderStatus: 'pending'
    });

    await order.save();

    // Create transaction record for platform escrow tracking
    const platformCommission = Math.round(totalAmount * 0.02); // 2% platform commission
    const sellerNetAmount = totalAmount - platformCommission;
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = new Transaction({
      transactionId,
      order: order._id,
      buyer: decoded.id,
      buyerModel,
      seller: product.supplier._id || product.supplier,
      product: productId,
      type: 'payment',
      amount: totalAmount,
      platformCommission,
      netAmount: sellerNetAmount,
      status: initialPaymentStatus,
      paymentMethod,
      description: `B2B Order ${orderNumber} - ${product.name} (${quantity} ${product.unit || 'units'})`,
      metadata: {
        orderNumber,
        productName: product.name,
        quantity,
        unitPrice,
        subtotal,
        shippingCost,
        insuranceCost,
        paymentDetails: order.paymentDetails
      }
    });

    await transaction.save();

    // Populate order for response
    await order.populate([
      { path: 'product', select: 'name images primaryImage category unit price' },
      { path: 'supplier', select: 'companyName firstName lastName email phone profileImage' }
    ]);

    // Dispatch real-time SMS to Supplier & Buyer (non-blocking)
    try {
      notifyNewOrderSMS({
        order,
        supplier: order.supplier,
        buyer: decoded,
        product
      }).catch(err => console.error('Order SMS notification error:', err));
    } catch (smsErr) {
      console.error('Trigger SMS error:', smsErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order,
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: totalAmount
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create order'
    }, { status: 500 });
  }
}
