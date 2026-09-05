import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthTokenPayload, requireAuth } from '@/lib/auth';

// GET: Retrieve orders for the authenticated user (or all if admin ?all=true)
export async function GET(req: NextRequest) {
  try {
    const authPayload = await getAuthTokenPayload(req);

    if (!authPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required to retrieve voyage orders',
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';

    let query: any = {};
    if (fetchAll && authPayload.role === 'admin') {
      query = {}; // Admin requested all orders
    } else {
      query = {
        $or: [
          { userId: authPayload.userId },
          { userEmail: authPayload.email.toLowerCase() },
        ],
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
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
        trackingNumber: o.trackingNumber || `JP-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
        shippingAddress: o.shippingAddress,
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}

// POST: Place a new order into MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order must contain at least one item',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const authPayload = await getAuthTokenPayload(req);

    const generatedOrderId =
      body.orderId ||
      body.id ||
      `GL-${Math.floor(100000 + Math.random() * 900000)}-SHIN`;

    const userId = authPayload?.userId || body.userId || 'guest';
    const userEmail = (authPayload?.email || body.userEmail || body.email || 'guest@onepiece-store.com').trim().toLowerCase();
    const customerName = authPayload?.name || body.customerName || body.name || 'Grand Line Voyager';

    const orderDoc = {
      id: generatedOrderId,
      orderId: generatedOrderId,
      userId,
      userEmail,
      customerName,
      items: body.items,
      subtotal: Number(body.subtotal || body.total || 0),
      discount: Number(body.discount || 0),
      shippingCost: Number(body.shippingCost || 0),
      total: Number(body.total || body.subtotal || 0),
      orderStatus: body.orderStatus || 'Processing',
      paymentStatus: body.paymentStatus || 'Paid',
      trackingNumber: body.trackingNumber || `JP-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      shippingAddress: body.shippingAddress || {
        address: body.address || 'Shibuya Ward, Dogenzaka 2-24',
        city: body.city || 'Tokyo',
        state: body.state || 'Tokyo Prefecture',
        postalCode: body.postalCode || '150-0043',
        country: body.country || 'Japan',
      },
    };

    const created = await Order.create(orderDoc);

    // Decrement stock for ordered products if products exist
    try {
      for (const item of body.items) {
        const prodId = item.product?.id || item.product?._id || item.id;
        if (prodId && item.quantity) {
          await Product.updateOne(
            { $or: [{ id: prodId }, { slug: prodId }] },
            { $inc: { stock: -Math.abs(item.quantity) } }
          );
        }
      }
    } catch (stockErr) {
      console.warn('Failed to decrement stock:', stockErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order: {
          id: created.id,
          orderId: created.orderId,
          userId: created.userId,
          userEmail: created.userEmail,
          customerName: created.customerName,
          items: created.items,
          subtotal: created.subtotal,
          discount: created.discount,
          shippingCost: created.shippingCost,
          total: created.total,
          orderStatus: created.orderStatus,
          paymentStatus: created.paymentStatus,
          trackingNumber: created.trackingNumber,
          shippingAddress: created.shippingAddress,
          createdAt: created.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to create order',
      },
      { status: 500 }
    );
  }
}
