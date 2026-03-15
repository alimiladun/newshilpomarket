import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Insight from '@/models/Insight';
import { verifyToken } from '@/lib/tokenUtils';

// GET /api/insights — public, paginated, filterable
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const sort = searchParams.get('sort') || '-publishDate';
    const adminView = searchParams.get('adminView') === 'true';

    let query = {};

    // Admin can see all statuses; public only sees published
    if (!adminView) {
      query.status = 'published';
    } else if (status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (featured === 'true') {
      query.featured = true;
    }
    if (trending === 'true') {
      query.trending = true;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [insights, total] = await Promise.all([
      Insight.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Insight.countDocuments(query),
    ]);

    // Derive category counts for public filter sidebar
    const categoryCounts = await Insight.aggregate([
      { $match: adminView ? {} : { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      insights,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categoryCounts,
    });
  } catch (error) {
    console.error('GET /api/insights error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/insights — admin only
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      type,
      category,
      tags,
      status,
      featured,
      trending,
      author,
      publishDate,
      metaTitle,
      metaDescription,
      featuredImage,
    } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const insight = await Insight.create({
      title,
      content,
      excerpt,
      type: type || 'blog',
      category,
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      trending: trending || false,
      author: author || 'Admin',
      publishDate: publishDate ? new Date(publishDate) : undefined,
      metaTitle,
      metaDescription,
      featuredImage: featuredImage || { url: '', publicId: '' },
    });

    return NextResponse.json(
      { success: true, insight, message: 'Insight created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/insights error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'An insight with a similar title already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
