import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { PRODUCTS } from '@/data/products';

export async function GET() {
  try {
    await connectToDatabase();

    const results = [];
    for (const item of PRODUCTS) {
      const updated = await Product.findOneAndUpdate(
        { id: item.id },
        { $set: item },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      results.push(updated.id);
    }

    const totalInDb = await Product.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Database successfully seeded with ${results.length} One Piece garments.`,
      totalInDb,
      seededIds: results,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to seed database',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
