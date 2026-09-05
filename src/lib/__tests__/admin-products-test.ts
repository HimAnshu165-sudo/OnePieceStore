import { GET as adminProductsGET, POST as adminProductsPOST } from '../../app/api/admin/products/route';
import {
  GET as adminProductDetailGET,
  PUT as adminProductDetailPUT,
  DELETE as adminProductDetailDELETE,
} from '../../app/api/admin/products/[id]/route';
import { NextRequest } from 'next/server';
import { createToken } from '../../lib/auth';
import Product from '../../models/Product';
import connectToDatabase from '../../lib/mongodb';

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

const adminToken = createToken({
  userId: 'admin_test_id',
  email: 'admin@onepiece-store.com',
  role: 'admin',
  name: 'Fleet Admiral',
});

const userToken = createToken({
  userId: 'user_test_id',
  email: 'user@onepiece-store.com',
  role: 'user',
  name: 'Straw Hat Sailor',
});

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

async function runAdminProductTests() {
  console.log('\n======================================================');
  console.log('   PHASE 2.7 ADMIN PRODUCT CRUD API TEST SUITE');
  console.log('======================================================\n');

  await connectToDatabase();

  // --- 1. UNAUTHENTICATED ACCESS ---
  console.log('--- 1. UNAUTHENTICATED GUARDS (401) ---');
  const unauthGetReq = createJsonRequest('http://localhost:3000/api/admin/products', 'GET');
  const unauthGetRes = await adminProductsGET(unauthGetReq);
  assert(unauthGetRes.status === 401, 'Unauthenticated GET /api/admin/products rejected with HTTP 401');

  const unauthPostReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', { name: 'Test' });
  const unauthPostRes = await adminProductsPOST(unauthPostReq);
  assert(unauthPostRes.status === 401, 'Unauthenticated POST /api/admin/products rejected with HTTP 401');

  // --- 2. REGULAR USER ACCESS ---
  console.log('\n--- 2. REGULAR USER GUARDS (403) ---');
  const userCookie = `auth_token=${userToken}`;
  const userGetReq = createJsonRequest('http://localhost:3000/api/admin/products', 'GET', undefined, userCookie);
  const userGetRes = await adminProductsGET(userGetReq);
  assert(userGetRes.status === 403, 'Regular user GET /api/admin/products rejected with HTTP 403 Forbidden');

  const userPostReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', { name: 'Test' }, userCookie);
  const userPostRes = await adminProductsPOST(userPostReq);
  assert(userPostRes.status === 403, 'Regular user POST /api/admin/products rejected with HTTP 403 Forbidden');

  const userPutReq = createJsonRequest('http://localhost:3000/api/admin/products/nika-01', 'PUT', { price: 100 }, userCookie);
  const userPutRes = await adminProductDetailPUT(userPutReq, { params: Promise.resolve({ id: 'nika-01' }) });
  assert(userPutRes.status === 403, 'Regular user PUT /api/admin/products/:id rejected with HTTP 403 Forbidden');

  const userDelReq = createJsonRequest('http://localhost:3000/api/admin/products/nika-01', 'DELETE', undefined, userCookie);
  const userDelRes = await adminProductDetailDELETE(userDelReq, { params: Promise.resolve({ id: 'nika-01' }) });
  assert(userDelRes.status === 403, 'Regular user DELETE /api/admin/products/:id rejected with HTTP 403 Forbidden');

  // --- 3. ADMIN LIST PRODUCTS ---
  console.log('\n--- 3. ADMIN LIST PRODUCTS (GET /api/admin/products) ---');
  const adminCookie = `auth_token=${adminToken}`;
  const adminGetReq = createJsonRequest('http://localhost:3000/api/admin/products', 'GET', undefined, adminCookie);
  const adminGetRes = await adminProductsGET(adminGetReq);
  const adminGetData = await adminGetRes.json();

  assert(adminGetRes.status === 200, 'Admin GET /api/admin/products returns HTTP 200 OK');
  assert(adminGetData.success === true, 'Admin GET response has success: true');
  assert(Array.isArray(adminGetData.products), 'Admin GET response has products array');
  assert(adminGetData.count === adminGetData.products.length, 'Admin GET count matches products array length');

  // --- 4. ADMIN CREATE PRODUCT (POST) ---
  console.log('\n--- 4. ADMIN CREATE PRODUCT (POST /api/admin/products) ---');
  const testProductId = 'test-gear5-hoodie';
  const testProductSlug = 'test-gear-5-liberation-hoodie';

  // Cleanup in case previous run left test item
  await Product.deleteOne({ id: testProductId });
  await Product.deleteOne({ slug: testProductSlug });

  const validNewProduct = {
    id: testProductId,
    slug: testProductSlug,
    name: 'Sun God Liberation Hoodie // Heavyweight Limited',
    japaneseName: '太陽の神 解放フーディー',
    crew: 'STRAW_HAT',
    character: 'Monkey D. Luffy',
    price: 110,
    compareAtPrice: 140,
    description: 'Ultra-heavyweight 600 GSM French Terry hoodie with embroidered drums of liberation crest.',
    story: 'Designed in homage to the warrior of liberation awakening.',
    details: ['600 GSM French Terry Cotton', 'Custom double-lined hood', 'Embroidered liberation insignia'],
    gsm: 600,
    cut: 'Drop Shoulder Boxy',
    fabric: '100% Organic French Terry',
    color: 'Obsidian Cloud',
    colorHex: '#141414',
    colors: [{ name: 'Obsidian Cloud', hex: '#141414', image: '/images/test-hoodie.jpg' }],
    sizes: ['M', 'L', 'XL'],
    stock: 25,
    images: ['/images/test-hoodie.jpg'],
    tags: ['Heavyweight', 'Limited Edition', 'Hoodie'],
    isNewDrop: true,
    isLimited: true,
    isBestseller: false,
    editionNumber: '001 / 100',
  };

  const createReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', validNewProduct, adminCookie);
  const createRes = await adminProductsPOST(createReq);
  const createData = await createRes.json();

  assert(createRes.status === 201, 'Admin POST valid product returns HTTP 201 Created');
  assert(createData.success === true, 'Create response has success: true');
  assert(createData.product?.id === testProductId, 'Created product id matches payload');
  assert(createData.product?.slug === testProductSlug, 'Created product slug matches payload');
  assert(createData.product?.price === 110, 'Created product price matches payload');

  // --- 5. ADMIN POST DUPLICATE ID (409) ---
  console.log('\n--- 5. PREVENT DUPLICATE ID (409 Conflict) ---');
  const duplicateIdProduct = {
    ...validNewProduct,
    slug: 'unique-slug-different-12345',
  };
  const dupIdReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', duplicateIdProduct, adminCookie);
  const dupIdRes = await adminProductsPOST(dupIdReq);
  const dupIdData = await dupIdRes.json();

  assert(dupIdRes.status === 409, 'Duplicate product id returns HTTP 409 Conflict');
  assert(dupIdData.success === false, 'Duplicate id response has success: false');
  assert(dupIdData.error.includes(testProductId), 'Duplicate id error specifies colliding ID');

  // --- 6. ADMIN POST DUPLICATE SLUG (409) ---
  console.log('\n--- 6. PREVENT DUPLICATE SLUG (409 Conflict) ---');
  const duplicateSlugProduct = {
    ...validNewProduct,
    id: 'unique-id-different-12345',
  };
  const dupSlugReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', duplicateSlugProduct, adminCookie);
  const dupSlugRes = await adminProductsPOST(dupSlugReq);
  const dupSlugData = await dupSlugRes.json();

  assert(dupSlugRes.status === 409, 'Duplicate slug returns HTTP 409 Conflict');
  assert(dupSlugData.success === false, 'Duplicate slug response has success: false');
  assert(dupSlugData.error.includes(testProductSlug), 'Duplicate slug error specifies colliding slug');

  // --- 7. ADMIN GET BY ID ---
  console.log('\n--- 7. ADMIN GET SINGLE PRODUCT BY ID (GET /api/admin/products/:id) ---');
  const getSingleReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'GET', undefined, adminCookie);
  const getSingleRes = await adminProductDetailGET(getSingleReq, { params: Promise.resolve({ id: testProductId }) });
  const getSingleData = await getSingleRes.json();

  assert(getSingleRes.status === 200, 'Admin GET /api/admin/products/:id returns HTTP 200 OK');
  assert(getSingleData.success === true, 'Get single product has success: true');
  assert(getSingleData.product?.id === testProductId, 'Get single product returned correct product');

  // --- 8. ADMIN UPDATE PRODUCT (PUT) ---
  console.log('\n--- 8. ADMIN UPDATE PRODUCT (PUT /api/admin/products/:id) ---');
  const updatePayload = {
    price: 125,
    stock: 50,
    name: 'Sun God Liberation Hoodie // Updated Special Edition',
  };
  const updateReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'PUT', updatePayload, adminCookie);
  const updateRes = await adminProductDetailPUT(updateReq, { params: Promise.resolve({ id: testProductId }) });
  const updateData = await updateRes.json();

  assert(updateRes.status === 200, 'Admin PUT /api/admin/products/:id returns HTTP 200 OK');
  assert(updateData.success === true, 'Update response has success: true');
  assert(updateData.product?.price === 125, 'Updated price reflected in response');
  assert(updateData.product?.stock === 50, 'Updated stock reflected in response');

  // Verify in MongoDB directly
  const dbUpdated = await Product.findOne({ id: testProductId }).lean();
  assert(dbUpdated?.price === 125, 'Updated price verified directly in MongoDB');
  assert(dbUpdated?.stock === 50, 'Updated stock verified directly in MongoDB');

  // Test preventing ID alteration
  const tryChangeIdReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'PUT', { id: 'cannot-change-this' }, adminCookie);
  const tryChangeIdRes = await adminProductDetailPUT(tryChangeIdReq, { params: Promise.resolve({ id: testProductId }) });
  assert(tryChangeIdRes.status === 400, 'Attempting to change product ID returns HTTP 400 Bad Request');

  // Test duplicate slug during update
  const tryDupSlugReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'PUT', { slug: 'sun-god-heavyweight-tee' }, adminCookie);
  const tryDupSlugRes = await adminProductDetailPUT(tryDupSlugReq, { params: Promise.resolve({ id: testProductId }) });
  assert(tryDupSlugRes.status === 409, 'Updating to an existing product slug returns HTTP 409 Conflict');

  // --- 9. ADMIN DELETE PRODUCT (DELETE) ---
  console.log('\n--- 9. ADMIN DELETE PRODUCT (DELETE /api/admin/products/:id) ---');
  const deleteReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'DELETE', undefined, adminCookie);
  const deleteRes = await adminProductDetailDELETE(deleteReq, { params: Promise.resolve({ id: testProductId }) });
  const deleteData = await deleteRes.json();

  assert(deleteRes.status === 200, 'Admin DELETE /api/admin/products/:id returns HTTP 200 OK');
  assert(deleteData.success === true, 'Delete response has success: true');
  assert(deleteData.message === 'Product deleted successfully', 'Delete response has correct message');

  // Verify removed from MongoDB
  const dbDeleted = await Product.findOne({ id: testProductId }).lean();
  assert(dbDeleted === null, 'Product successfully removed from MongoDB');

  // --- 10. NOT FOUND ON UNKNOWN ID (404) ---
  console.log('\n--- 10. UNKNOWN ID HANDLING (404) ---');
  const unknownId = 'non-existent-product-id-999';
  const getUnknownReq = createJsonRequest(`http://localhost:3000/api/admin/products/${unknownId}`, 'GET', undefined, adminCookie);
  const getUnknownRes = await adminProductDetailGET(getUnknownReq, { params: Promise.resolve({ id: unknownId }) });
  assert(getUnknownRes.status === 404, 'GET unknown product ID returns HTTP 404 Not Found');

  const putUnknownReq = createJsonRequest(`http://localhost:3000/api/admin/products/${unknownId}`, 'PUT', { price: 99 }, adminCookie);
  const putUnknownRes = await adminProductDetailPUT(putUnknownReq, { params: Promise.resolve({ id: unknownId }) });
  assert(putUnknownRes.status === 404, 'PUT unknown product ID returns HTTP 404 Not Found');

  const delUnknownReq = createJsonRequest(`http://localhost:3000/api/admin/products/${unknownId}`, 'DELETE', undefined, adminCookie);
  const delUnknownRes = await adminProductDetailDELETE(delUnknownReq, { params: Promise.resolve({ id: unknownId }) });
  assert(delUnknownRes.status === 404, 'DELETE unknown product ID returns HTTP 404 Not Found');

  // --- 11. INVALID REQUEST BODY (400) ---
  console.log('\n--- 11. INVALID REQUEST BODY VALIDATION (400) ---');
  const invalidBodyReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', { id: 'bad-prod' }, adminCookie);
  const invalidBodyRes = await adminProductsPOST(invalidBodyReq);
  const invalidBodyData = await invalidBodyRes.json();

  assert(invalidBodyRes.status === 400, 'POST with missing required fields returns HTTP 400 Bad Request');
  assert(invalidBodyData.success === false, 'Invalid body response has success: false');
  assert(invalidBodyData.error === 'Validation failed', 'Invalid body response specifies validation error');

  console.log(`\n======================================================`);
  console.log(`TOTAL ADMIN PRODUCT API TESTS: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdminProductTests().catch((err) => {
  console.error('Fatal error in Admin Product API test suite:', err);
  process.exit(1);
});
