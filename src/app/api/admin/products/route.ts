import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { validateCreateProductInput } from '@/lib/validations/product';

const ALLOWED_SORTS = ['price_asc', 'price_desc', 'gsm', 'newest'] as const;
type AllowedSort = (typeof ALLOWED_SORTS)[number];

/**
 * GET /api/admin/products
 * Admin-only: Fetch product catalog with optional search, crew filter, and sorting
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authorize Admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const crew = searchParams.get('crew')?.trim() || '';
    const sortParam = searchParams.get('sort')?.trim() || '';

    // 2. Validate sort parameter if provided
    if (sortParam && !ALLOWED_SORTS.includes(sortParam as AllowedSort)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid sort option "${sortParam}". Supported values: ${ALLOWED_SORTS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 3. Build MongoDB query filter
    const filter: Record<string, unknown> = {};

    if (crew) {
      filter.crew = crew;
    }

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

    // 4. Build MongoDB sort options
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

    // 5. Connect to database
    await connectToDatabase();

    // 6. Query products
    const products = await Product.find(filter).sort(sortOptions).lean();

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

/**
 * POST /api/admin/products
 * Admin-only: Create a new product in the catalog
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    // 2. Parse request JSON body safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request body',
        },
        { status: 400 }
      );
    }

    // 3. Validate product creation payload
    const validation = validateCreateProductInput(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const productData = validation.data;

    // 4. Connect to database
    await connectToDatabase();

    // 5. Prevent duplicate product ID
    const existingId = await Product.findOne({ id: productData.id }).lean();
    if (existingId) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with ID "${productData.id}" already exists`,
        },
        { status: 409 }
      );
    }

    // 6. Prevent duplicate slug
    const existingSlug = await Product.findOne({ slug: productData.slug }).lean();
    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with slug "${productData.slug}" already exists`,
        },
        { status: 409 }
      );
    }

    // 7. Create and persist product
    const createdProduct = await Product.create(productData);

    const safeProduct = {
      id: createdProduct.id,
      slug: createdProduct.slug,
      name: createdProduct.name,
      japaneseName: createdProduct.japaneseName,
      crew: createdProduct.crew,
      character: createdProduct.character,
      price: createdProduct.price,
      compareAtPrice: createdProduct.compareAtPrice,
      description: createdProduct.description,
      story: createdProduct.story,
      details: createdProduct.details || [],
      gsm: createdProduct.gsm,
      cut: createdProduct.cut,
      fabric: createdProduct.fabric,
      color: createdProduct.color,
      colorHex: createdProduct.colorHex,
      colors: createdProduct.colors || [],
      sizes: createdProduct.sizes || [],
      stock: createdProduct.stock,
      images: createdProduct.images || [],
      tags: createdProduct.tags || [],
      isNewDrop: createdProduct.isNewDrop,
      isLimited: createdProduct.isLimited,
      isBestseller: createdProduct.isBestseller,
      editionNumber: createdProduct.editionNumber,
      createdAt: createdProduct.createdAt,
      updatedAt: createdProduct.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        product: safeProduct,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while creating product';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
