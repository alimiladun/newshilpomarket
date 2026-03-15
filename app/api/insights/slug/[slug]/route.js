import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Insight from '@/models/Insight';

// GET /api/insights/slug/[slug] — public, fetch insight by slug, increment views
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const insight = await Insight.findOne({ slug, status: 'published' }).lean();
    if (!insight) {
      return NextResponse.json(
        { success: false, message: 'Insight not found' },
        { status: 404 }
      );
    }

    // Increment views non-blocking
    Insight.findByIdAndUpdate(insight._id, { $inc: { views: 1 } })
      .exec()
      .catch((err) => console.error('Views increment error:', err));

    // Fetch related insights from same category
    const related = await Insight.find({
      category: insight.category,
      status: 'published',
      _id: { $ne: insight._id },
    })
      .select('title slug excerpt featuredImage category readTime author publishDate createdAt')
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(4)
      .lean();

    return NextResponse.json({ success: true, insight, related });
  } catch (error) {
    console.error('GET /api/insights/slug/[slug] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
