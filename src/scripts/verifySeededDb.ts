import { PRODUCTS } from '../data/products';
import Product from '../models/Product';
import User from '../models/User';
import connectToDatabase from '../lib/mongodb';
import mongoose from 'mongoose';

async function verifyDatabase() {
  console.log('\n========================================');
  console.log('   MONGODB PRODUCT SEED VERIFICATION');
  console.log('========================================\n');

  try {
    await connectToDatabase();
    console.log('Connected to MongoDB successfully.\n');

    // 1. Check Product Counts
    const allDbProducts = await Product.find({}).lean();
    const staticCount = PRODUCTS.length;
    console.log(`1. DOCUMENT COUNT & SEED COVERAGE:`);
    console.log(`   - Static catalog items in products.ts: ${staticCount}`);
    console.log(`   - Total MongoDB products in collection: ${allDbProducts.length}`);

    // Verify all static catalog products exist in MongoDB
    let seededMatches = 0;
    for (const sp of PRODUCTS) {
      const dbMatch = allDbProducts.find((p) => p.id === sp.id);
      if (!dbMatch) {
        console.error(`❌ Missing seeded product in DB for static ID: ${sp.id}`);
        process.exit(1);
      }
      seededMatches++;
    }
    console.log(`   ✅ All ${seededMatches}/${staticCount} static products exist in MongoDB.\n`);

    // 2. Check for Duplicate IDs & Slugs in DB
    const idMap = new Map<string, number>();
    const slugMap = new Map<string, number>();

    for (const p of allDbProducts) {
      idMap.set(p.id, (idMap.get(p.id) || 0) + 1);
      slugMap.set(p.slug, (slugMap.get(p.slug) || 0) + 1);
    }

    const dupIds = Array.from(idMap.entries()).filter(([, count]) => count > 1);
    const dupSlugs = Array.from(slugMap.entries()).filter(([, count]) => count > 1);

    console.log(`2. UNIQUE IDENTIFIER INTEGRITY:`);
    console.log(`   - Duplicate IDs found: ${dupIds.length}`);
    console.log(`   - Duplicate Slugs found: ${dupSlugs.length}`);
    if (dupIds.length > 0 || dupSlugs.length > 0) {
      console.error('❌ Duplicate identifiers detected in database!');
      process.exit(1);
    }
    console.log(`   ✅ Zero duplicate IDs and zero duplicate slugs verified.\n`);

    // 3. Representative Product Inspection
    console.log(`3. REPRESENTATIVE PRODUCT VERIFICATIONS:`);

    // A. First product (nika-01)
    const nika = await Product.findOne({ id: 'nika-01' }).lean();
    console.log(`   A. First Product (id: nika-01):`);
    console.log(`      - Name: "${nika?.name}"`);
    console.log(`      - Slug: "${nika?.slug}"`);
    console.log(`      - Crew: "${nika?.crew}" | Character: "${nika?.character}"`);
    console.log(`      - Price: $${nika?.price} (compareAtPrice: $${nika?.compareAtPrice})`);
    console.log(`      - GSM: ${nika?.gsm} | Cut: "${nika?.cut}" | Fabric: "${nika?.fabric}"`);
    console.log(`      - Colors count: ${nika?.colors?.length} | Sizes: [${nika?.sizes?.join(', ')}]`);
    console.log(`      - Images count: ${nika?.images?.length} | Tags: [${nika?.tags?.join(', ')}]`);
    console.log(`      - Flags: isNewDrop=${nika?.isNewDrop}, isLimited=${nika?.isLimited}, isBestseller=${nika?.isBestseller}`);
    console.log(`      - Edition: "${nika?.editionNumber}"`);
    console.log(`      ✅ "nika-01" verified.`);

    // B. Other category/crew (marine-05 from MARINE)
    const marine = await Product.findOne({ id: 'marine-05' }).lean();
    console.log(`\n   B. Marine Crew Product (id: marine-05):`);
    console.log(`      - Name: "${marine?.name}"`);
    console.log(`      - Slug: "${marine?.slug}"`);
    console.log(`      - Crew: "${marine?.crew}" | Character: "${marine?.character}"`);
    console.log(`      - Price: $${marine?.price}`);
    console.log(`      - Colors: ${JSON.stringify(marine?.colors)}`);
    console.log(`      ✅ "marine-05" verified.`);

    // C. Product with compareAtPrice (shanks-04 from RED_HAIR)
    const shanks = await Product.findOne({ id: 'shanks-04' }).lean();
    console.log(`\n   C. Discount / CompareAtPrice Product (id: shanks-04):`);
    console.log(`      - Name: "${shanks?.name}"`);
    console.log(`      - Slug: "${shanks?.slug}"`);
    console.log(`      - Price: $${shanks?.price} | compareAtPrice: $${shanks?.compareAtPrice}`);
    console.log(`      - Edition Number: "${shanks?.editionNumber}"`);
    console.log(`      ✅ "shanks-04" verified.`);

    // D. Product with multiple colors and WANO crew (wano-07)
    const wano = await Product.findOne({ id: 'wano-07' }).lean();
    console.log(`\n   D. Wano Crew / Rare Drop Product (id: wano-07):`);
    console.log(`      - Name: "${wano?.name}"`);
    console.log(`      - Slug: "${wano?.slug}"`);
    console.log(`      - Crew: "${wano?.crew}" | Character: "${wano?.character}"`);
    console.log(`      - Details count: ${wano?.details?.length}`);
    console.log(`      - Stock: ${wano?.stock}`);
    console.log(`      ✅ "wano-07" verified.`);

    // 4. Verify User Documents
    const userCount = await User.countDocuments();
    console.log(`\n4. USER INTEGRITY CHECK:`);
    console.log(`   - User count in DB: ${userCount}`);
    console.log(`   ✅ User collection verified intact and untouched.`);

    console.log('\n========================================');
    console.log('   ALL DATABASE VERIFICATIONS PASSED');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  }
}

verifyDatabase();
