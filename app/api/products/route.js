import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import { verifyToken } from '@/lib/tokenUtils';

// GET - Fetch all products or supplier's products
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || '-createdAt';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const includeTotal = searchParams.get('includeTotal') === 'true';

    let query = { isActive: true };

    // Filter by supplier
    if (supplierId) {
      query.supplier = supplierId;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search by name, category, supplierName, or description
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');

      const synonymMap = {
        'রড': ['steel', 'rod', 'rebar', 'bsrm', 'মেটাল', 'লোহা', 'রড', '৬০ গ্রেড'],
        'স্ক্র্যাপ': ['scrap', 'লোহা', 'মেটাল', 'ধাতব', 'স্ক্র্যাপ'],
        'প্লাস্টিক': ['plastic', 'granule', 'polymer', 'pp', 'pvc', 'দানা', 'প্লাস্টিক'],
        'সুতা': ['yarn', 'cotton', 'thread', 'textile', 'সুতা', 'তুলা', 'সুতি'],
        'তুলা': ['cotton', 'yarn', 'textile', 'তুলা', 'সুতা', 'সুতি'],
        'পাট': ['jute', 'bag', 'বস্তা', 'পাট'],
        'সিমেন্ট': ['cement', 'clinker', 'সিমেন্ট'],
        'কেমিক্যাল': ['chemical', 'acid', 'soda', 'রাসায়নিক', 'সোডা', 'কেমিক্যাল', 'কস্টিক'],
        'steel': ['রড', 'স্ক্র্যাপ', 'মেটাল', 'steel', 'rod', 'rebar'],
        'jute': ['পাট', 'বস্তা', 'jute'],
        'cotton': ['তুলা', 'সুতা', 'সুতি', 'cotton', 'yarn'],
        'plastic': ['প্লাস্টিক', 'দানা', 'plastic', 'polymer']
      };

      const orConditions = [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { supplierName: { $regex: regex } },
        { description: { $regex: regex } },
      ];

      const lowerSearch = cleanSearch.toLowerCase();
      for (const [key, syns] of Object.entries(synonymMap)) {
        if (cleanSearch.includes(key) || lowerSearch.includes(key)) {
          syns.forEach(syn => {
            const synRegex = new RegExp(syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            orConditions.push({ name: { $regex: synRegex } });
            orConditions.push({ category: { $regex: synRegex } });
          });
        }
      }

      const words = cleanSearch.split(/\s+/).filter(w => w.length > 1);
      if (words.length > 1) {
        words.forEach(word => {
          const wRegex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
          orConditions.push({ name: { $regex: wRegex } });
          orConditions.push({ category: { $regex: wRegex } });
        });
      }

      query.$or = orConditions;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.inStock = true;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (page - 1) * limit;

    // Only select the fields needed for the product card — no populate needed
    // because supplierName is already denormalized on the product document.
    const LIST_FIELDS =
      '_id name price unit minOrder inStock images primaryImage category rating reviewCount supplierName supplier location';

    const productsPromise = Product.find(query)
      .select(LIST_FIELDS)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPromise = includeTotal
      ? Product.countDocuments(query)
      : Promise.resolve(null);

    let [products, total] = await Promise.all([
      productsPromise,
      totalPromise
    ]);

    // Exact Match & Relevance Ranking
    if (search && search.trim() && Array.isArray(products)) {
      const term = search.trim().toLowerCase();
      products.sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();

        // 1. Exact full name match
        const aExact = aName === term;
        const bExact = bName === term;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // 2. Name starts with search term
        const aStarts = aName.startsWith(term);
        const bStarts = bName.startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // 3. Name contains search term
        const aContains = aName.includes(term);
        const bContains = bName.includes(term);
        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;

        return 0;
      });
    }

    const responseBody = {
      success: true,
      products
    };

    if (includeTotal && typeof total === 'number') {
      responseBody.pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    }

    const response = NextResponse.json(responseBody, { status: 200 });

    // Cache for 60 s in the browser, allow stale for 120 s while revalidating
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}

// POST - Create new product
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
    if (!decoded || decoded.type !== 'supplier') {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication'
      }, { status: 401 });
    }

    const body = await request.json();

    // Get supplier info
    const supplier = await Supplier.findById(decoded.id).select('firstName lastName companyName phone address');
    if (!supplier) {
      return NextResponse.json({
        success: false,
        message: 'Supplier not found'
      }, { status: 404 });
    }

    // Format images flexibly (accept strings or objects)
    const rawImages = Array.isArray(body.images) 
      ? body.images 
      : (body.imageUrl ? [body.imageUrl] : []);
    const formattedImages = rawImages.map(img => 
      typeof img === 'string' ? { url: img, resourceType: 'image' } : img
    );
    const primaryImage = body.primaryImage || (formattedImages.length > 0 ? formattedImages[0].url : null);

    // Auto-generate rich description if empty
    const autoDesc = `${body.name || 'কাঁচামাল'} - উচ্চমানের পাইকারি পণ্য। সরাসরি মিল ও অনুমোদিত সরবরাহকারীর পক্ষ থেকে বিক্রয়ের জন্য তালিকাভুক্ত।`;

    // Category mapping helper
    const categoryMap = {
      'Metals & Alloys': 1,
      'Iron / Rod / Steel': 1,
      'লোহা / রড / স্টিল': 1,
      'স্ক্র্যাপ লোহা': 1,
      'Plastics & Polymers': 2,
      'প্লাস্টিক দানা / PVC': 2,
      'Chemicals': 3,
      'রাসায়নিক': 3,
      'Textiles': 4,
      'তুলা / সুতা': 4,
      'পাট ও পাটজাত পণ্য': 4,
      'Construction Materials': 5,
      'সিমেন্ট ও নির্মাণ সামগ্রী': 5,
      'সিমেন্ট / নির্মাণ সামগ্রী': 5,
      'অ্যালুমিনিয়াম / তামা': 1,
      'কাগজ ও প্যাকেজিং': 8,
      'Food & Agriculture': 6,
      'Energy & Fuel': 7,
      'Machinery & Equipment': 9,
      'Packaging': 8,
      'Other': 10,
    };
    const catId = body.categoryId || categoryMap[body.category] || 1;

    // Determine inStock status
    let inStockStatus = true;
    if (body.inStock !== undefined) {
      inStockStatus = Boolean(body.inStock);
    } else if (body.stock !== undefined) {
      inStockStatus = parseInt(body.stock) > 0;
    }

    // Prepare product data
    const productData = {
      name: body.name,
      description: body.description?.trim() || autoDesc,
      category: body.category || 'Other',
      categoryId: catId,
      price: parseFloat(body.price),
      unit: body.unit || 'tons',
      minOrder: body.minOrder ? parseInt(body.minOrder) : 1,
      maxOrder: body.maxOrder ? parseInt(body.maxOrder) : 10000,
      stockQuantity: body.stock ? parseInt(body.stock) : (body.stockQuantity ? parseInt(body.stockQuantity) : 100),
      inStock: inStockStatus,
      images: formattedImages,
      primaryImage,
      specifications: body.specifications || {},
      tags: body.tags || [body.category || 'raw-materials'],
      supplier: decoded.id,
      supplierName: supplier.companyName || `${supplier.firstName} ${supplier.lastName}`.trim(),
      location: body.location || body.origin || supplier.address || 'বাংলাদেশ',
      shipping: {
        deliveryTime: body.leadTime ? `${body.leadTime} days` : '১-৩ কার্যদিবস | 1-3 business days'
      }
    };

    const product = await Product.create(productData);
    
    console.log('Product created successfully:', product._id);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create product'
    }, { status: 500 });
  }
}
