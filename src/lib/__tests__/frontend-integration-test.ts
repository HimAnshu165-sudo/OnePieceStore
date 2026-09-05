import { GET as productsListGET } from '../../app/api/products/route';
import { GET as singleProductGET } from '../../app/api/products/[slug]/route';
import { NextRequest } from 'next/server';
import { mapSortOptionToApi } from '../products';

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
    headers: { 'Accept': 'application/json' },
  });
}

async function runFrontendIntegrationTests() {
  console.log('\n======================================================');
  console.log('   PHASE 2.8 FRONTEND PRODUCT API INTEGRATION TESTS');
  console.log('======================================================\n');

  // --- 1. Map Sort Option Helper Tests ---
  console.log('--- 1. SORT OPTION TO API MAPPING TESTS ---');
  assert(mapSortOptionToApi('PRICE_LOW') === 'price_asc', 'PRICE_LOW maps to price_asc');
  assert(mapSortOptionToApi('PRICE_HIGH') === 'price_desc', 'PRICE_HIGH maps to price_desc');
  assert(mapSortOptionToApi('GSM') === 'gsm', 'GSM maps to gsm');
  assert(mapSortOptionToApi('NEWEST') === 'newest', 'NEWEST maps to newest');
  assert(mapSortOptionToApi('FEATURED') === undefined, 'FEATURED maps to default (undefined)');

  // --- 2. Public Products List API Integration ---
  console.log('\n--- 2. HOMEPAGE PRODUCTRAIL API INTEGRATION ---');
  const allReq = createRequest('http://localhost:3000/api/products');
  const allRes = await productsListGET(allReq);
  const allData = await allRes.json();

  assert(allRes.status === 200, 'GET /api/products returns HTTP 200 for ProductRail');
  assert(allData.success === true, 'Response contains success: true');
  assert(Array.isArray(allData.products) && allData.products.length >= 7, 'Returns full seeded catalog for ProductRail');

  // --- 3. Category / Crew Filtering ---
  console.log('\n--- 3. CREW CATEGORY FILTERING INTEGRATION ---');
  const crewReq = createRequest('http://localhost:3000/api/products?crew=STRAW_HAT');
  const crewRes = await productsListGET(crewReq);
  const crewData = await crewRes.json();

  assert(crewRes.status === 200, 'Crew filter returns HTTP 200');
  assert(crewData.products.length > 0, 'Straw Hat category returns matching products');
  assert(crewData.products.every((p: { crew: string }) => p.crew === 'STRAW_HAT'), 'All filtered products belong to STRAW_HAT');

  // --- 4. Sorting Integration ---
  console.log('\n--- 4. SORTING INTEGRATION ---');
  const sortLowReq = createRequest('http://localhost:3000/api/products?sort=price_asc');
  const sortLowRes = await productsListGET(sortLowReq);
  const sortLowData = await sortLowRes.json();
  const pricesAsc = sortLowData.products.map((p: { price: number }) => p.price);
  const isAsc = pricesAsc.every((v: number, i: number) => i === 0 || v >= pricesAsc[i - 1]);
  assert(isAsc, 'ProductRail price low to high sorting works');

  const sortGsmReq = createRequest('http://localhost:3000/api/products?sort=gsm');
  const sortGsmRes = await productsListGET(sortGsmReq);
  const sortGsmData = await sortGsmRes.json();
  const gsmDesc = sortGsmData.products.map((p: { gsm: number }) => p.gsm);
  const isGsmDesc = gsmDesc.every((v: number, i: number) => i === 0 || v <= gsmDesc[i - 1]);
  assert(isGsmDesc, 'ProductRail GSM sorting returns highest fabric weight first');

  // --- 5. SearchModal API Search with ?q= ---
  console.log('\n--- 5. SEARCHMODAL API SEARCH WITH ?q= ---');
  const searchReq = createRequest('http://localhost:3000/api/products?q=zoro');
  const searchRes = await productsListGET(searchReq);
  const searchData = await searchRes.json();

  assert(searchRes.status === 200, 'Search query returns HTTP 200');
  assert(searchData.products.length >= 1, 'Search finds Zoro product');
  assert(searchData.products.some((p: { character: string }) => p.character === 'Roronoa Zoro'), 'Found product has character Roronoa Zoro');

  // --- 6. Lookbook Hotspot ID Resolution ---
  console.log('\n--- 6. LOOKBOOK HOTSPOT RESOLUTION ---');
  const nikaReq = createRequest('http://localhost:3000/api/products/nika-01');
  const nikaRes = await singleProductGET(nikaReq, { params: Promise.resolve({ slug: 'nika-01' }) });
  const nikaData = await nikaRes.json();

  assert(nikaRes.status === 200, 'Lookbook hotspot nika-01 resolves with HTTP 200');
  assert(nikaData.product?.id === 'nika-01', 'Lookbook resolves correct product ID for nika-01');
  assert(nikaData.product?.slug === 'sun-god-heavyweight-tee', 'Lookbook resolves correct slug for nika-01');

  const shanksReq = createRequest('http://localhost:3000/api/products/shanks-04');
  const shanksRes = await singleProductGET(shanksReq, { params: Promise.resolve({ slug: 'shanks-04' }) });
  const shanksData = await shanksRes.json();

  assert(shanksRes.status === 200, 'Lookbook hotspot shanks-04 resolves with HTTP 200');
  assert(shanksData.product?.id === 'shanks-04', 'Lookbook resolves correct product ID for shanks-04');
  assert(shanksData.product?.character === 'Shanks', 'Lookbook resolves Shanks character');

  // --- 7. ProductDetailModal Data Completeness ---
  console.log('\n--- 7. PRODUCTDETAILMODAL DATA COMPLETENESS ---');
  const p = nikaData.product;
  assert(typeof p.name === 'string' && p.name.length > 0, 'Product has valid name');
  assert(typeof p.japaneseName === 'string' && p.japaneseName.length > 0, 'Product has valid japaneseName');
  assert(typeof p.character === 'string' && p.character.length > 0, 'Product has valid character');
  assert(typeof p.price === 'number' && p.price > 0, 'Product has valid price');
  assert(typeof p.description === 'string' && p.description.length > 0, 'Product has valid description');
  assert(typeof p.story === 'string' && p.story.length > 0, 'Product has valid story');
  assert(Array.isArray(p.details) && p.details.length > 0, 'Product has details list');
  assert(typeof p.gsm === 'number' && p.gsm > 0, 'Product has valid GSM');
  assert(typeof p.cut === 'string' && p.cut.length > 0, 'Product has valid cut');
  assert(typeof p.fabric === 'string' && p.fabric.length > 0, 'Product has valid fabric');
  assert(typeof p.color === 'string' && p.color.length > 0, 'Product has valid color');
  assert(Array.isArray(p.colors) && p.colors.length > 0, 'Product has colors array');
  assert(Array.isArray(p.sizes) && p.sizes.length > 0, 'Product has sizes array');
  assert(typeof p.stock === 'number' && p.stock >= 0, 'Product has valid stock');
  assert(Array.isArray(p.images) && p.images.length > 0, 'Product has images array');
  assert(Array.isArray(p.tags) && p.tags.length > 0, 'Product has tags array');

  console.log(`\n======================================================`);
  console.log(`TOTAL FRONTEND INTEGRATION TESTS: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFrontendIntegrationTests().catch((err) => {
  console.error('Fatal error in Frontend Integration test suite:', err);
  process.exit(1);
});
