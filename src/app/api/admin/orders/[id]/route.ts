import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

function buildOrderLookupQuery(id: string) {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const conditions: Array<Record<string, unknown>> = [
    { id: id },
    { orderId: id },
  ];

  if (isObjectId) {
    conditions.push({ _id: new mongoose.Types.ObjectId(id) });
  }

  return { $or: conditions };
}

// GET: Single order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findOne(buildOrderLookupQuery(id)).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH / PUT: Update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    await connectToDatabase();

    const updateFields: any = {};
    if (body.orderStatus) updateFields.orderStatus = body.orderStatus;
    if (body.paymentStatus) updateFields.paymentStatus = body.paymentStatus;
    if (body.trackingNumber) updateFields.trackingNumber = body.trackingNumber;

    const updated = await Order.findOneAndUpdate(
      buildOrderLookupQuery(id),
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

// DELETE: Cancel/delete order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await Order.findOneAndDelete(buildOrderLookupQuery(id));
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Order '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order '${id}' deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
