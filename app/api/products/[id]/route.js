import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/tokenUtils';

// GET - Fetch single product by ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    
    // Select only the fields the detail page actually renders
    const DETAIL_FIELDS =
      'name description category price unit minOrder maxOrder inStock stockQuantity images primaryImage supplierName supplier location specifications shipping rating reviewCount isFeatured tags slug createdAt';

    const product = await Product.findById(id)
      .select(DETAIL_FIELDS)
      .populate('supplier', 'companyName email phone profileImage address isVerified isApproved rating')
      .lean();

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    // Increment view count fire-and-forget (non-blocking)
    Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec().catch(err => console.error('View count update error:', err));

    const response = NextResponse.json({
      success: true,
      product
    }, { status: 200 });

    // Cache product detail for 2 min; stale-while-revalidate for 5 min
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return response;

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
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
    if (!decoded || decoded.type !== 'supplier') {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify product belongs to this supplier
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    if (product.supplier.toString() !== decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to update this product'
      }, { status: 403 });
    }

    // Prepare update data
    const updateData = {
      name: body.name,
      description: body.description,
      category: body.category,
      price: parseFloat(body.price),
      unit: body.unit || 'pieces',
      minOrder: body.minOrder ? parseInt(body.minOrder) : 1,
      maxOrder: body.maxOrder ? parseInt(body.maxOrder) : 10000,
      stockQuantity: body.stock ? parseInt(body.stock) : 0,
      inStock: body.stock ? parseInt(body.stock) > 0 : true,
      images: body.images || [],
      primaryImage: body.images && body.images.length > 0 ? body.images[0].url : null,
      specifications: body.specifications || {},
      tags: body.tags || [],
      location: body.origin || '',
      shipping: {
        deliveryTime: body.leadTime ? `${body.leadTime} days` : body.shipping?.deliveryTime || '7-14 business days',
        shippingCost: body.shipping?.shippingCost || body.shippingCost || 'Calculated at checkout',
        freeShippingThreshold: body.shipping?.freeShippingThreshold || body.freeShippingThreshold || 0,
        international: body.shipping?.international || body.internationalShipping || false
      }
    };

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Product updated:', id);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    }, { status: 200 });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update product'
    }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
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
    if (!decoded || decoded.type !== 'supplier') {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    const { id } = await params;

    // Verify product belongs to this supplier
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    if (product.supplier.toString() !== decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to delete this product'
      }, { status: 403 });
    }

    // Soft delete - mark as inactive
    await Product.findByIdAndUpdate(id, { isActive: false });

    console.log('Product deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete product'
    }, { status: 500 });
  }
}

// PATCH - Quick partial update (e.g. stock toggle, price change)
export async function PATCH(request, { params }) {
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
    if (!decoded || decoded.type !== 'supplier') {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    if (product.supplier.toString() !== decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 403 });
    }

    // Apply allowed partial updates
    const updates = {};
    if (body.inStock !== undefined) updates.inStock = Boolean(body.inStock);
    if (body.price !== undefined) updates.price = parseFloat(body.price);
    if (body.stockQuantity !== undefined) updates.stockQuantity = parseInt(body.stockQuantity);
    if (body.minOrder !== undefined) updates.minOrder = parseInt(body.minOrder);

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    }, { status: 200 });

  } catch (error) {
    console.error('Patch product error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update product'
    }, { status: 500 });
  }
}
