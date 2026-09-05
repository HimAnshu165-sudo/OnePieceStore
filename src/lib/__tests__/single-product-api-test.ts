import { GET as singleProductGET } from '../../app/api/products/[slug]/route';
import { NextRequest } from 'next/server';

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

function createRequest(url: string): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
  });
}

async function runSingleProductApiTests() {
  console.log('\n======================================================');
  console.log('   PHASE 2.6 SINGLE PRODUCT API TEST SUITE');
  console.log('======================================================\n');

  // --- 1. Lookup by valid slug 1 (Sun God Nika) ---
  console.log('--- 1. LOOKUP BY PRIMARY SLUG (Sun God Nika) ---');
  const slug1 = 'sun-god-heavyweight-tee';
  const req1 = createRequest(`http://localhost:3000/api/products/${slug1}`);
  const res1 = await singleProductGET(req1, { params: Promise.resolve({ slug: slug1 }) });
  const data1 = await res1.json();

  assert(res1.status === 200, 'GET /api/products/[slug] returns HTTP 200 OK for valid slug');
  assert(data1.success === true, 'Response contains success: true');
  assert(data1.product !== undefined, 'Response contains product object');
  assert(data1.product.slug === slug1, 'Product slug matches requested slug');
  assert(data1.product.id === 'nika-01', 'Product id matches expected seed ID');
  assert(data1.product.name.includes('Sun God Nika'), 'Product name matches seed catalog');
  assert(data1.product.crew === 'STRAW_HAT', 'Product crew matches seed catalog');
  assert(data1.product.price === 95, 'Product price matches seed catalog');
  assert(data1.product.gsm === 500, 'Product gsm matches seed catalog');
  assert(Array.isArray(data1.product.details), 'Product has details array');
  assert(Array.isArray(data1.product.colors), 'Product has colors array');
  assert(Array.isArray(data1.product.sizes), 'Product has sizes array');
  assert(Array.isArray(data1.product.images), 'Product has images array');
  assert(Array.isArray(data1.product.tags), 'Product has tags array');

  // --- 2. Lookup by valid slug 2 (Zoro Santoryu) ---
  console.log('\n--- 2. LOOKUP BY ANOTHER VALID SLUG (Zoro Santoryu) ---');
  const slug2 = 'santoryu-oni-killer-tee';
  const req2 = createRequest(`http://localhost:3000/api/products/${slug2}`);
  const res2 = await singleProductGET(req2, { params: Promise.resolve({ slug: slug2 }) });
  const data2 = await res2.json();

  assert(res2.status === 200, 'GET /api/products/[slug] returns HTTP 200 OK for second valid slug');
  assert(data2.success === true, 'Response contains success: true');
  assert(data2.product.slug === slug2, 'Product slug matches requested slug');
  assert(data2.product.id === 'zoro-02', 'Product id matches expected seed ID');
  assert(data2.product.character === 'Roronoa Zoro', 'Product character matches seed catalog');

  // --- 3. Lookup by custom Product ID (Fallback support) ---
  console.log('\n--- 3. LOOKUP BY CUSTOM PRODUCT ID (Fallback) ---');
  const idParam = 'law-03';
  const req3 = createRequest(`http://localhost:3000/api/products/${idParam}`);
  const res3 = await singleProductGET(req3, { params: Promise.resolve({ slug: idParam }) });
  const data3 = await res3.json();

  assert(res3.status === 200, 'GET /api/products/[id] returns HTTP 200 OK when querying by custom ID');
  assert(data3.success === true, 'Response contains success: true');
  assert(data3.product.id === 'law-03', 'Product id matches requested custom ID');
  assert(data3.product.slug === 'room-death-surgeon-tee', 'Product slug matches corresponding product');
  assert(data3.product.character === 'Trafalgar D. Water Law', 'Product character matches seed catalog');

  // --- 4. Lookup by non-existent slug ---
  console.log('\n--- 4. NOT FOUND HANDLING ---');
  const invalidSlug = 'does-not-exist';
  const req4 = createRequest(`http://localhost:3000/api/products/${invalidSlug}`);
  const res4 = await singleProductGET(req4, { params: Promise.resolve({ slug: invalidSlug }) });
  const data4 = await res4.json();

  assert(res4.status === 404, 'GET /api/products/does-not-exist returns HTTP 404 Not Found');
  assert(data4.success === false, '404 response contains success: false');
  assert(data4.message === 'Product not found', '404 response contains clear "Product not found" message');
  assert(data4.product === undefined, '404 response does not contain product object');

  // --- 5. Empty / Whitespace-only Slug Parameter ---
  console.log('\n--- 5. INVALID / EMPTY SLUG PARAMETER ---');
  const emptySlug = '   ';
  const req5 = createRequest(`http://localhost:3000/api/products/${encodeURIComponent(emptySlug)}`);
  const res5 = await singleProductGET(req5, { params: Promise.resolve({ slug: emptySlug }) });
  const data5 = await res5.json();

  assert(res5.status === 400, 'Empty slug returns HTTP 400 Bad Request');
  assert(data5.success === false, '400 response contains success: false');
  assert(data5.message === 'Product slug or ID is required', '400 response contains clear error message');

  // --- 6. URL-Encoded Slug Lookup ---
  console.log('\n--- 6. URL-ENCODED SLUG LOOKUP ---');
  const encodedSlug = encodeURIComponent('sun-god-heavyweight-tee');
  const req6 = createRequest(`http://localhost:3000/api/products/${encodedSlug}`);
  const res6 = await singleProductGET(req6, { params: Promise.resolve({ slug: encodedSlug }) });
  const data6 = await res6.json();

  assert(res6.status === 200, 'URL-encoded slug returns HTTP 200 OK');
  assert(data6.product.slug === 'sun-god-heavyweight-tee', 'Decoded slug matches product correctly');

  console.log(`\n======================================================`);
  console.log(`TOTAL SINGLE PRODUCT API TESTS: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSingleProductApiTests().catch((err) => {
  console.error('Fatal error in Single Product API test suite:', err);
  process.exit(1);
});
