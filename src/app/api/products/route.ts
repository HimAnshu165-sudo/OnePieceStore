import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { PRODUCTS } from '@/data/products';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Auto-seed if database is currently empty
    const count = await Product.countDocuments();
    if (count === 0) {
      for (const item of PRODUCTS) {
        await Product.findOneAndUpdate(
          { id: item.id },
          { $set: item },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const crew = searchParams.get('crew');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort');
    const query = searchParams.get('q');

    const filter: Record<string, any> = {};

    if (crew && crew !== 'ALL') {
      filter.crew = crew;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (query) {
      const regex = new RegExp(query, 'i');
      filter.$or = [
        { name: regex },
        { character: regex },
        { japaneseName: regex },
        { crew: regex },
        { tags: regex },
      ];
    }

    let queryBuilder = Product.find(filter).lean();

    // Sorting
    switch (sort) {
      case 'PRICE_LOW':
        queryBuilder = queryBuilder.sort({ price: 1 });
        break;
      case 'PRICE_HIGH':
        queryBuilder = queryBuilder.sort({ price: -1 });
        break;
      case 'GSM':
        queryBuilder = queryBuilder.sort({ gsm: -1 });
        break;
      case 'NEWEST':
        queryBuilder = queryBuilder.sort({ isNewDrop: -1, createdAt: -1 });
        break;
      default:
        // FEATURED
        break;
    }

    const products = await queryBuilder.exec();

    // Clean MongoDB internal fields if any remain
    const sanitized = products.map((doc: any) => {
      const { _id, __v, ...rest } = doc;
      return rest;
    });

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      products: sanitized,
    });
  } catch (error: any) {
    console.error('Error fetching products from MongoDB:', error);
    // Graceful fallback to static data if MongoDB is temporarily unreachable
    return NextResponse.json({
      success: true,
      count: PRODUCTS.length,
      products: PRODUCTS,
      fallback: true,
    });
  }
}
