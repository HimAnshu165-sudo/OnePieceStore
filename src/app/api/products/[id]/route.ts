import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { PRODUCTS } from '@/data/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const productDoc = await Product.findOne({
      $or: [{ id }, { slug: id }],
    }).lean();

    if (!productDoc) {
      // Check fallback
      const fallbackItem = PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (fallbackItem) {
        return NextResponse.json({ success: true, product: fallbackItem });
      }
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const { _id, __v, ...product } = productDoc as any;

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Error fetching product by ID from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
