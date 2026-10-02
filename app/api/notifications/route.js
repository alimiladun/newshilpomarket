import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/tokenUtils';

// GET - Fetch notifications for authenticated user
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
        message: 'Invalid session'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 15;

    // Match notifications for this user ID or by their phone number
    const query = {
      $or: [
        { recipient: decoded.id },
        ...(decoded.phone ? [{ phone: decoded.phone }] : [])
      ]
    };

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ ...query, isRead: false })
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server error'
    }, { status: 500 });
  }
}

// PUT - Mark notification(s) as read
export async function PUT(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll = false } = body;

    const baseQuery = {
      $or: [
        { recipient: decoded.id },
        ...(decoded.phone ? [{ phone: decoded.phone }] : [])
      ]
    };

    if (markAll) {
      await Notification.updateMany(baseQuery, { $set: { isRead: true } });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, ...baseQuery }, { $set: { isRead: true } });
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications updated'
    }, { status: 200 });

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
