import { PRODUCTS } from '../data/products';
import Product from '../models/Product';
import connectToDatabase from '../lib/mongodb';
import mongoose from 'mongoose';

// Load .env.local for standalone CLI script execution
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    try {
      process.loadEnvFile();
    } catch {
      // Ignore if env file is already in process.env
    }
  }
}

async function seedProducts() {
  console.log('\n========================================');
  console.log('   ONEPIECE STORE - PRODUCT SEED SCRIPT');
  console.log('========================================\n');

  console.log('Product seed started...');

  // 1. Validate static PRODUCTS data integrity
  if (!Array.isArray(PRODUCTS) || PRODUCTS.length === 0) {
    console.error('❌ Data Error: PRODUCTS is empty or not an array.');
    process.exit(1);
  }

  console.log(`Found ${PRODUCTS.length} products in static catalog.`);

  // 2. Validate IDs and check for duplicates
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  for (const product of PRODUCTS) {
    if (!product.id || typeof product.id !== 'string' || !product.id.trim()) {
      console.error(`❌ Validation Error: Product missing valid id: "${product.name || 'unnamed'}"`);
      process.exit(1);
    }
    const cleanId = product.id.trim();
    if (seenIds.has(cleanId)) {
      duplicateIds.push(cleanId);
    }
    seenIds.add(cleanId);
  }

  if (duplicateIds.length > 0) {
    console.error(`❌ Validation Error: Duplicate product IDs detected: ${duplicateIds.join(', ')}`);
    process.exit(1);
  }

  // 3. Validate Slugs and check for duplicates
  const seenSlugs = new Set<string>();
  const duplicateSlugs: string[] = [];

  for (const product of PRODUCTS) {
    if (!product.slug || typeof product.slug !== 'string' || !product.slug.trim()) {
      console.error(`❌ Validation Error: Product missing valid slug: "${product.name || product.id}"`);
      process.exit(1);
    }
    const cleanSlug = product.slug.trim().toLowerCase();
    if (seenSlugs.has(cleanSlug)) {
      duplicateSlugs.push(cleanSlug);
    }
    seenSlugs.add(cleanSlug);
  }

  if (duplicateSlugs.length > 0) {
    console.error(`❌ Validation Error: Duplicate product slugs detected: ${duplicateSlugs.join(', ')}`);
    process.exit(1);
  }

  console.log('Static data validation passed (unique IDs and slugs verified).\n');

  // 4. Connect to MongoDB
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to MongoDB successfully.\n');

    console.log('Seeding products (idempotent upsert by id):');

    let processedCount = 0;

    for (let i = 0; i < PRODUCTS.length; i++) {
      const product = PRODUCTS[i];
      console.log(`  ${i + 1}/${PRODUCTS.length} ${product.name} [${product.id}]`);

      await Product.findOneAndUpdate(
        { id: product.id },
        { $set: product },
        {
          upsert: true,
          returnDocument: 'after',
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      processedCount++;
    }

    console.log('\nProduct seed completed successfully.');
    console.log(`Inserted/updated: ${processedCount}`);
    console.log('\n========================================');
    console.log('   PRODUCT SEEDING COMPLETED');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Error during product seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

seedProducts();
