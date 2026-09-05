import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

interface RouteContext {
  params: Promise<{ slug: string }> | { slug: string };
}

/**
 * Helper to safely extract and decode slug from context.params in Next.js App Router
 */
async function getSlugFromContext(context: RouteContext): Promise<string> {
  const resolved = await Promise.resolve(context?.params);
  const rawSlug = resolved?.slug || '';
  try {
    return decodeURIComponent(rawSlug).trim();
  } catch {
    return rawSlug.trim();
  }
}

/**
 * GET /api/products/[slug]
 * Public endpoint: Retrieve a single product by slug (or fallback by product ID)
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const slug = await getSlugFromContext(context);

    // 1. Validate slug parameter
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product slug or ID is required',
        },
        { status: 400 }
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Primary lookup by slug, with fallback to custom ID
    let product = await Product.findOne({ slug }).lean();
    if (!product) {
      product = await Product.findOne({ id: slug }).lean();
    }

    // 4. Handle Not Found
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    // 5. Map to safe representation matching existing Product type
    const safeProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      japaneseName: product.japaneseName,
      crew: product.crew,
      character: product.character,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      description: product.description,
      story: product.story,
      details: product.details || [],
      gsm: product.gsm,
      cut: product.cut,
      fabric: product.fabric,
      color: product.color,
      colorHex: product.colorHex,
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock: product.stock,
      images: product.images || [],
      tags: product.tags || [],
      isNewDrop: product.isNewDrop,
      isLimited: product.isLimited,
      isBestseller: product.isBestseller,
      editionNumber: product.editionNumber,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        product: safeProduct,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while fetching product';
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
