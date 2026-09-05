import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { validateUpdateProductInput } from '@/lib/validations/product';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * Helper to safely extract id from context.params in Next.js App Router
 */
async function getIdFromContext(context: RouteContext): Promise<string> {
  const resolved = await Promise.resolve(context?.params);
  const rawId = resolved?.id || '';
  try {
    return decodeURIComponent(rawId).trim();
  } catch {
    return rawId.trim();
  }
}

/**
 * Helper to build lookup query supporting custom id, slug, or MongoDB _id
 */
function buildProductLookupQuery(id: string): Record<string, unknown> {
  const conditions: Array<Record<string, unknown>> = [{ id }, { slug: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }
  return { $or: conditions };
}

/**
 * GET /api/admin/products/[id]
 * Admin-only: Retrieve a single product by stable Product id
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorize Admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const id = await getIdFromContext(context);
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
          message: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Find product by stable ID, slug, or MongoDB ObjectId
    const product = await Product.findOne(buildProductLookupQuery(id)).lean();
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

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

/**
 * PUT /api/admin/products/[id]
 * Admin-only: Update a product by stable Product id
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorize Admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const id = await getIdFromContext(context);
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    // 2. Parse request JSON body
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

    // 3. Validate product update payload
    const validation = validateUpdateProductInput(body);
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

    const updateData = validation.data;

    // 4. Prevent changing stable Product ID
    if (updateData.id && updateData.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Changing the product ID is not allowed',
        },
        { status: 400 }
      );
    }

    // Delete id from updateData to prevent overriding
    delete updateData.id;

    // 5. Connect to database
    await connectToDatabase();

    // 6. Check existing product
    const existingProduct = await Product.findOne(buildProductLookupQuery(id)).lean();
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    // 7. Check duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const duplicateSlug = await Product.findOne({
        slug: updateData.slug,
        _id: { $ne: existingProduct._id },
      }).lean();

      if (duplicateSlug) {
        return NextResponse.json(
          {
            success: false,
            error: `Product with slug "${updateData.slug}" already exists`,
          },
          { status: 409 }
        );
      }
    }

    // 8. Update product in database
    const updated = await Product.findOneAndUpdate(
      { _id: existingProduct._id },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    const safeProduct = {
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      japaneseName: updated.japaneseName,
      crew: updated.crew,
      character: updated.character,
      price: updated.price,
      compareAtPrice: updated.compareAtPrice,
      description: updated.description,
      story: updated.story,
      details: updated.details || [],
      gsm: updated.gsm,
      cut: updated.cut,
      fabric: updated.fabric,
      color: updated.color,
      colorHex: updated.colorHex,
      colors: updated.colors || [],
      sizes: updated.sizes || [],
      stock: updated.stock,
      images: updated.images || [],
      tags: updated.tags || [],
      isNewDrop: updated.isNewDrop,
      isLimited: updated.isLimited,
      isBestseller: updated.isBestseller,
      editionNumber: updated.editionNumber,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
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
      error instanceof Error ? error.message : 'An error occurred while updating product';
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
 * DELETE /api/admin/products/[id]
 * Admin-only: Delete a product by stable Product id, slug, or _id
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorize Admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const id = await getIdFromContext(context);
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID is required',
          message: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Delete product by stable ID, slug, or MongoDB ObjectId
    const deleted = await Product.findOneAndDelete(buildProductLookupQuery(id)).lean();
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found in database',
          message: 'Product not found in database',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
        deletedProduct: {
          id: deleted.id,
          name: deleted.name,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while deleting product';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

