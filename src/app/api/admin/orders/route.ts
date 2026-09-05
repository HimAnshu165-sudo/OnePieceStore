import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    await connectToDatabase();

    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map((o: any) => ({
        id: o.id || o.orderId,
        orderId: o.orderId || o.id,
        userId: o.userId,
        userEmail: o.userEmail,
        customerName: o.customerName,
        items: o.items || [],
        subtotal: o.subtotal,
        discount: o.discount || 0,
        shippingCost: o.shippingCost || 0,
        total: o.total,
        orderStatus: o.orderStatus || 'Processing',
        paymentStatus: o.paymentStatus || 'Paid',
        trackingNumber: o.trackingNumber,
        shippingAddress: o.shippingAddress,
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Admin GET orders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch admin orders',
      },
      { status: 500 }
    );
  }
}
