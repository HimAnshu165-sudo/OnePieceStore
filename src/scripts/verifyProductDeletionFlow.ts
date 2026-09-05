import { DELETE as adminProductDELETE, GET as adminProductDetailGET } from '../app/api/admin/products/[id]/route';
import { GET as publicProductsGET } from '../app/api/products/route';
import { NextRequest } from 'next/server';
import { createToken, hashPassword } from '../lib/auth';
import Product from '../models/Product';
import User from '../models/User';
import connectToDatabase from '../lib/mongodb';
import mongoose from 'mongoose';

// Load .env.local
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    try {
      process.loadEnvFile();
    } catch {}
  }
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

function createJsonRequest(url: string, method: string, body?: Record<string, unknown>, cookie?: string): NextRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function runVerification() {
  console.log('\n===============================================================');
  console.log('   ADMIN PORTAL PRODUCT DELETION FULL FLOW VERIFICATION');
  console.log('===============================================================\n');

  console.log('1. Connecting to live MongoDB...');
  await connectToDatabase();
  console.log('Connected to MongoDB.\n');

  // Create test admin
  const testAdminEmail = 'admin-delete-test@onepiece-store.com';
  let adminUser = await User.findOne({ email: testAdminEmail });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Admin Delete Tester',
      email: testAdminEmail,
      password: await hashPassword('AdminPass123!'),
      role: 'admin',
    });
  }

  const adminToken = createToken({
    userId: adminUser._id.toString(),
    email: adminUser.email,
    role: 'admin',
    name: adminUser.name,
  });
  const adminCookie = `auth_token=${adminToken}`;

  // Create test regular user
  const testUserEmail = 'user-delete-test@onepiece-store.com';
  let regularUser = await User.findOne({ email: testUserEmail });
  if (!regularUser) {
    regularUser = await User.create({
      name: 'Regular Crew Tester',
      email: testUserEmail,
      password: await hashPassword('UserPass123!'),
      role: 'user',
    });
  }

  const userToken = createToken({
    userId: regularUser._id.toString(),
    email: regularUser.email,
    role: 'user',
    name: regularUser.name,
  });
  const userCookie = `auth_token=${userToken}`;

  // Step 1: Create a distinct test product in MongoDB
  const testProdId = 'test-delete-garment-999';
  const testProdSlug = 'test-delete-garment-999-slug';

  // Clean any previous test run
  await Product.deleteMany({ id: testProdId });

  const testProductDoc = await Product.create({
    id: testProdId,
    slug: testProdSlug,
    name: 'Test Decommission Garment // Wano Special Edition',
    japaneseName: 'テスト削除衣服',
    crew: 'STRAW_HAT',
    character: 'Monkey D. Luffy',
    price: 99,
    compareAtPrice: 130,
    description: 'A test product created to verify persistent database deletion from the Admin Portal.',
    story: 'Test lore for deletion flow.',
    details: ['500 GSM Test Cotton', 'Limited Edition Run'],
    gsm: 500,
    cut: 'Oversized Boxy Silhouette',
    fabric: '100% Combed Cotton',
    color: 'Obsidian Black',
    colorHex: '#141414',
    colors: [{ name: 'Obsidian Black', hex: '#141414', image: '/images/luffy-sun-god.jpg' }],
    sizes: ['M', 'L', 'XL'],
    stock: 20,
    images: ['/images/luffy-sun-god.jpg'],
    tags: ['Test', 'Decommission'],
    isNewDrop: true,
  });

  console.log('--- TEST STEP 1: Verify product exists in MongoDB before delete ---');
  const existsBefore = await Product.findOne({ id: testProdId }).lean();
  assert(existsBefore !== null && existsBefore.id === testProdId, 'Product successfully created and exists in MongoDB');

  console.log('\n--- TEST STEP 2: Verify unauthenticated user CANNOT delete product ---');
  const unauthReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProdId}`, 'DELETE');
  const unauthRes = await adminProductDELETE(unauthReq, { params: Promise.resolve({ id: testProdId }) });
  assert(unauthRes.status === 401, 'Unauthenticated DELETE /api/admin/products/:id rejected with HTTP 401');

  const stillExistsAfterUnauth = await Product.findOne({ id: testProdId }).lean();
  assert(stillExistsAfterUnauth !== null, 'Product remains in MongoDB after rejected unauthenticated attempt');

  console.log('\n--- TEST STEP 3: Verify regular user (non-admin) CANNOT delete product ---');
  const userReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProdId}`, 'DELETE', undefined, userCookie);
  const userRes = await adminProductDELETE(userReq, { params: Promise.resolve({ id: testProdId }) });
  assert(userRes.status === 403, 'Non-admin DELETE /api/admin/products/:id rejected with HTTP 403 Forbidden');

  const stillExistsAfterUser = await Product.findOne({ id: testProdId }).lean();
  assert(stillExistsAfterUser !== null, 'Product remains in MongoDB after rejected non-admin attempt');

  console.log('\n--- TEST STEP 4: Admin performs DELETE /api/admin/products/:id ---');
  const adminReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProdId}`, 'DELETE', undefined, adminCookie);
  const adminRes = await adminProductDELETE(adminReq, { params: Promise.resolve({ id: testProdId }) });
  const adminData = await adminRes.json();

  assert(adminRes.status === 200, 'Admin DELETE /api/admin/products/:id returns HTTP 200 OK');
  assert(adminData.success === true, 'Admin DELETE response has success: true');
  assert(adminData.message === 'Product deleted successfully', 'Admin DELETE response message confirms success');

  console.log('\n--- TEST STEP 5: Verify product is PERMANENTLY deleted from MongoDB database ---');
  const existsAfterDelete = await Product.findOne({ id: testProdId }).lean();
  assert(existsAfterDelete === null, 'Product record is NOT in MongoDB (null returned) - Database deletion succeeded');

  const existsBySlugAfterDelete = await Product.findOne({ slug: testProdSlug }).lean();
  assert(existsBySlugAfterDelete === null, 'Product record is NOT in MongoDB by slug either - Fully removed');

  console.log('\n--- TEST STEP 6: Verify Admin Portal product list endpoint does NOT return deleted product ---');
  const adminListReq = createJsonRequest('http://localhost:3000/api/admin/products', 'GET', undefined, adminCookie);
  const adminListRes = await (await import('../app/api/admin/products/route')).GET(adminListReq);
  const adminListData = await adminListRes.json();
  const foundInAdminList = adminListData.products?.some((p: any) => p.id === testProdId);
  assert(!foundInAdminList, 'Deleted product is absent from GET /api/admin/products catalogue');

  console.log('\n--- TEST STEP 7: Verify Public Storefront product list endpoint does NOT return deleted product ---');
  const publicListReq = createJsonRequest('http://localhost:3000/api/products', 'GET');
  const publicListRes = await publicProductsGET(publicListReq);
  const publicListData = await publicListRes.json();
  const foundInPublicList = publicListData.products?.some((p: any) => p.id === testProdId);
  assert(!foundInPublicList, 'Deleted product is absent from GET /api/products storefront listing');

  console.log('\n--- TEST STEP 8: Verify deleting non-existent product returns HTTP 404 ---');
  const notFoundReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProdId}`, 'DELETE', undefined, adminCookie);
  const notFoundRes = await adminProductDELETE(notFoundReq, { params: Promise.resolve({ id: testProdId }) });
  const notFoundData = await notFoundRes.json();
  assert(notFoundRes.status === 404, 'Deleting non-existent product returns HTTP 404 Not Found');
  assert(notFoundData.success === false, '404 response has success: false');

  console.log('\n===============================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification()
  .catch((err) => {
    console.error('Fatal error during deletion flow verification:', err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
