import { GET as productsGET } from '../../app/api/products/route';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { Product } from '@/types';

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

async function runProductsApiTests() {
  console.log('\n======================================================');
  console.log('   PHASE 2.5 PUBLIC PRODUCT LIST API TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Test GET /api/products (Default list)
    const allReq = createRequest('http://localhost:3000/api/products');
    const allRes = await productsGET(allReq);
    const allData = await allRes.json();

    assert(allRes.status === 200, 'GET /api/products returns HTTP 200 OK');
    assert(allData.success === true, 'Response contains success: true');
    assert(Array.isArray(allData.products), 'Response contains products array');
    assert(typeof allData.count === 'number' && allData.count === allData.products.length, 'Response count matches products array length');
    assert(allData.count >= 7, 'Response returns all catalog products');

    // Verify first product structure
    const sample = allData.products[0] as Product;
    assert(typeof sample.id === 'string' && sample.id.length > 0, 'Product has valid id');
    assert(typeof sample.slug === 'string' && sample.slug.length > 0, 'Product has valid slug');
    assert(typeof sample.name === 'string' && sample.name.length > 0, 'Product has valid name');
    assert(typeof sample.japaneseName === 'string', 'Product has valid japaneseName');
    assert(typeof sample.crew === 'string', 'Product has valid crew');
    assert(typeof sample.character === 'string', 'Product has valid character');
    assert(typeof sample.price === 'number', 'Product has valid price');
    assert(typeof sample.gsm === 'number', 'Product has valid gsm');
    assert(Array.isArray(sample.details), 'Product has details array');
    assert(Array.isArray(sample.colors), 'Product has colors array');
    assert(Array.isArray(sample.sizes), 'Product has sizes array');
    assert(Array.isArray(sample.images), 'Product has images array');
    assert(Array.isArray(sample.tags), 'Product has tags array');

    // 2. Test GET /api/products?q=luffy (Search)
    const searchReq = createRequest('http://localhost:3000/api/products?q=luffy');
    const searchRes = await productsGET(searchReq);
    const searchData = await searchRes.json();

    assert(searchRes.status === 200, 'GET /api/products?q=luffy returns HTTP 200 OK');
    assert(searchData.count >= 1, 'Search for "luffy" returns at least 1 match');
    assert(
      (searchData.products as Product[]).every((p: Product) =>
        p.name.toLowerCase().includes('luffy') ||
        p.character.toLowerCase().includes('luffy') ||
        p.tags.some((t: string) => t.toLowerCase().includes('luffy'))
      ),
      'All search results contain search term in relevant fields'
    );

    // 3. Test GET /api/products?crew=STRAW_HAT (Crew Filter)
    const crewReq = createRequest('http://localhost:3000/api/products?crew=STRAW_HAT');
    const crewRes = await productsGET(crewReq);
    const crewData = await crewRes.json();

    assert(crewRes.status === 200, 'GET /api/products?crew=STRAW_HAT returns HTTP 200 OK');
    assert(crewData.count >= 1, 'Crew filter returns matching products');
    assert(
      (crewData.products as Product[]).every((p: Product) => p.crew === 'STRAW_HAT'),
      'All filtered products have crew === "STRAW_HAT"'
    );

    // 4. Test GET /api/products?sort=price_asc
    const sortAscReq = createRequest('http://localhost:3000/api/products?sort=price_asc');
    const sortAscRes = await productsGET(sortAscReq);
    const sortAscData = await sortAscRes.json();

    assert(sortAscRes.status === 200, 'GET /api/products?sort=price_asc returns HTTP 200 OK');
    const pricesAsc = (sortAscData.products as Product[]).map((p: Product) => p.price);
    const isSortedAsc = pricesAsc.every((val: number, i: number) => i === 0 || val >= pricesAsc[i - 1]);
    assert(isSortedAsc, 'Products are correctly sorted in ascending order of price');

    // 5. Test GET /api/products?sort=price_desc
    const sortDescReq = createRequest('http://localhost:3000/api/products?sort=price_desc');
    const sortDescRes = await productsGET(sortDescReq);
    const sortDescData = await sortDescRes.json();

    assert(sortDescRes.status === 200, 'GET /api/products?sort=price_desc returns HTTP 200 OK');
    const pricesDesc = (sortDescData.products as Product[]).map((p: Product) => p.price);
    const isSortedDesc = pricesDesc.every((val: number, i: number) => i === 0 || val <= pricesDesc[i - 1]);
    assert(isSortedDesc, 'Products are correctly sorted in descending order of price');

    // 6. Test GET /api/products?sort=gsm
    const sortGsmReq = createRequest('http://localhost:3000/api/products?sort=gsm');
    const sortGsmRes = await productsGET(sortGsmReq);
    const sortGsmData = await sortGsmRes.json();

    assert(sortGsmRes.status === 200, 'GET /api/products?sort=gsm returns HTTP 200 OK');
    const gsms = (sortGsmData.products as Product[]).map((p: Product) => p.gsm);
    const isSortedGsm = gsms.every((val: number, i: number) => i === 0 || val <= gsms[i - 1]);
    assert(isSortedGsm, 'Products are correctly sorted in descending order of GSM (highest GSM first)');

    // 7. Test GET /api/products?sort=newest
    const sortNewestReq = createRequest('http://localhost:3000/api/products?sort=newest');
    const sortNewestRes = await productsGET(sortNewestReq);
    const sortNewestData = await sortNewestRes.json();

    assert(sortNewestRes.status === 200, 'GET /api/products?sort=newest returns HTTP 200 OK');
    assert((sortNewestData.products as Product[]).length > 0, 'Newest sort returns product list');

    // 8. Test GET /api/products?q=luffy&crew=STRAW_HAT&sort=price_asc (Combined query)
    const combinedReq = createRequest('http://localhost:3000/api/products?q=luffy&crew=STRAW_HAT&sort=price_asc');
    const combinedRes = await productsGET(combinedReq);
    const combinedData = await combinedRes.json();

    assert(combinedRes.status === 200, 'Combined query returns HTTP 200 OK');
    assert(combinedData.success === true, 'Combined query returns success: true');
    assert(
      (combinedData.products as Product[]).every((p: Product) => p.crew === 'STRAW_HAT' && p.character.toLowerCase().includes('luffy')),
      'Combined query matches both search and crew constraints'
    );

    // 9. Test GET /api/products?sort=invalid (Error handling)
    const invalidSortReq = createRequest('http://localhost:3000/api/products?sort=invalid_sort_param');
    const invalidSortRes = await productsGET(invalidSortReq);
    const invalidSortData = await invalidSortRes.json();

    assert(invalidSortRes.status === 400, 'Invalid sort option returns HTTP 400 Bad Request');
    assert(invalidSortData.success === false, 'Invalid sort returns success: false');
    assert(invalidSortData.error.includes('Invalid sort option'), 'Invalid sort returns clear error message');

    console.log(`\n======================================================`);
    console.log(`TOTAL PUBLIC PRODUCT API TESTS: ${passed} passed, ${failed} failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error in products API test suite:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

runProductsApiTests();
