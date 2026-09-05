import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

const ALLOWED_SORTS = ['price_asc', 'price_desc', 'gsm', 'newest'] as const;
type AllowedSort = (typeof ALLOWED_SORTS)[number];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q')?.trim() || '';
    const crew = searchParams.get('crew')?.trim() || '';
    const sortParam = searchParams.get('sort')?.trim() || '';

    // 1. Validate sort parameter if provided
    if (sortParam && !ALLOWED_SORTS.includes(sortParam as AllowedSort)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid sort option "${sortParam}". Supported values: ${ALLOWED_SORTS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 2. Build MongoDB query filter
    const filter: Record<string, unknown> = {};

    // Crew filter (exact match, case-consistent)
    if (crew) {
      filter.crew = crew;
    }

    // Full-text search across name, japaneseName, character, crew, tags, and description
    if (q) {
      const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: escapedQuery, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { japaneseName: searchRegex },
        { character: searchRegex },
        { crew: searchRegex },
        { tags: searchRegex },
        { description: searchRegex },
      ];
    }

    // 3. Build MongoDB sort options
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };

    if (sortParam === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortParam === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortParam === 'gsm') {
      sortOptions = { gsm: -1 };
    } else if (sortParam === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Query products from MongoDB
    const products = await Product.find(filter).sort(sortOptions).lean();

    // 6. Map to safe representation matching existing Product type
    const safeProducts = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      japaneseName: p.japaneseName,
      crew: p.crew,
      character: p.character,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      description: p.description,
      story: p.story,
      details: p.details || [],
      gsm: p.gsm,
      cut: p.cut,
      fabric: p.fabric,
      color: p.color,
      colorHex: p.colorHex,
      colors: p.colors || [],
      sizes: p.sizes || [],
      stock: p.stock,
      images: p.images || [],
      tags: p.tags || [],
      isNewDrop: p.isNewDrop,
      isLimited: p.isLimited,
      isBestseller: p.isBestseller,
      editionNumber: p.editionNumber,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        products: safeProducts,
        count: safeProducts.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while fetching products';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
