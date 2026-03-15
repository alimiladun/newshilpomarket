import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Insight from '@/models/Insight';
import cloudinary from '@/lib/cloudinary';
import { verifyToken } from '@/lib/tokenUtils';

// GET /api/insights/[id] — public, increments views
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const insight = await Insight.findById(id).lean();
    if (!insight) {
      return NextResponse.json(
        { success: false, message: 'Insight not found' },
        { status: 404 }
      );
    }

    // Increment views non-blocking
    Insight.findByIdAndUpdate(id, { $inc: { views: 1 } })
      .exec()
      .catch((err) => console.error('Views increment error:', err));

    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('GET /api/insights/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PUT /api/insights/[id] — admin only
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

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

    // If a new featured image was uploaded and replaces the old one, delete old from Cloudinary
    const existing = await Insight.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Insight not found' },
        { status: 404 }
      );
    }

    if (
      body.featuredImage?.publicId &&
      existing.featuredImage?.publicId &&
      body.featuredImage.publicId !== existing.featuredImage.publicId
    ) {
      cloudinary.uploader
        .destroy(existing.featuredImage.publicId)
        .catch((err) => console.error('Cloudinary delete error:', err));
    }

    // publishDate handling
    if (body.publishDate) {
      body.publishDate = new Date(body.publishDate);
    }

    const insight = await Insight.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      insight,
      message: 'Insight updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/insights/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/insights/[id] — admin only
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

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

    const insight = await Insight.findByIdAndDelete(id);
    if (!insight) {
      return NextResponse.json(
        { success: false, message: 'Insight not found' },
        { status: 404 }
      );
    }

    // Remove Cloudinary image if it exists
    if (insight.featuredImage?.publicId) {
      cloudinary.uploader
        .destroy(insight.featuredImage.publicId)
        .catch((err) => console.error('Cloudinary delete error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Insight deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/insights/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
