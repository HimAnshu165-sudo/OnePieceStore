import { POST as signupPOST } from '../app/api/auth/signup/route';
import { POST as loginPOST } from '../app/api/auth/login/route';
import { POST as logoutPOST } from '../app/api/auth/logout/route';
import { GET as meGET } from '../app/api/auth/me/route';
import { GET as adminUsersGET } from '../app/api/admin/users/route';
import {
  GET as adminUserDetailGET,
  PUT as adminUserDetailPUT,
  DELETE as adminUserDetailDELETE,
} from '../app/api/admin/users/[id]/route';
import { GET as productsListGET } from '../app/api/products/route';
import { GET as singleProductGET } from '../app/api/products/[slug]/route';
import { GET as adminProductsGET, POST as adminProductsPOST } from '../app/api/admin/products/route';
import {
  GET as adminProductDetailGET,
  PUT as adminProductDetailPUT,
  DELETE as adminProductDetailDELETE,
} from '../app/api/admin/products/[id]/route';
import { NextRequest } from 'next/server';
import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import Product from '../models/Product';
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
    'Accept': 'application/json',
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

async function runFinalBackendVerification() {
  console.log('\n======================================================');
  console.log('   PHASE 3.0 — FINAL BACKEND END-TO-END VERIFICATION');
  console.log('======================================================\n');

  await connectToDatabase();

  // Clean test artifacts from previous runs if any
  const testUserEmail = 'e2e_sailor_test_2026@strawhat.com';
  const testAdminEmail = 'e2e_admiral_test_2026@navy.gov';
  const testProductId = 'e2e-test-gear5-jacket';
  const testProductSlug = 'e2e-test-gear5-liberation-jacket';

  await User.deleteMany({ email: { $in: [testUserEmail, testAdminEmail] } });
  await Product.deleteOne({ id: testProductId });
  await Product.deleteOne({ slug: testProductSlug });

  // ==========================================
  // 1. AUTHENTICATION (POST /api/auth/signup, login, me, logout)
  // ==========================================
  console.log('--- 1. AUTHENTICATION & SIGNUP API ---');
  // 1.1 Valid User Signup
  const signupReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'E2E Sailor',
    email: testUserEmail,
    password: 'securePassword2026!',
    role: 'admin', // Attempt role escalation
  });
  const signupRes = await signupPOST(signupReq);
  const signupData = await signupRes.json();
  const signupCookie = signupRes.headers.get('set-cookie') || '';

  assert(signupRes.status === 201, 'POST /api/auth/signup returns HTTP 201 Created');
  assert(signupData.success === true, 'Signup response contains success: true');
  assert(signupData.user?.email === testUserEmail, 'Signup response contains correct email');
  assert(signupData.user?.role === 'user', 'Signup strictly enforces role === "user" (no escalation)');
  assert(signupData.user?.password === undefined, 'Signup never returns password');
  assert(signupData.token === undefined, 'Signup does not leak JWT in JSON body');
  assert(signupCookie.includes('auth_token='), 'Signup sets auth_token cookie');
  assert(signupCookie.includes('HttpOnly'), 'Signup cookie is HttpOnly');

  // 1.2 Duplicate Email Signup
  const dupSignupReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'Duplicate Sailor',
    email: testUserEmail,
    password: 'securePassword2026!',
  });
  const dupSignupRes = await signupPOST(dupSignupReq);
  assert(dupSignupRes.status === 400, 'Signup with duplicate email returns HTTP 400 Bad Request');

  // 1.3 Invalid Signup Input
  const invalidSignupReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: '',
    email: 'not-an-email',
    password: '123',
  });
  const invalidSignupRes = await signupPOST(invalidSignupReq);
  assert(invalidSignupRes.status === 400, 'Signup with invalid input returns HTTP 400 Bad Request');

  // 1.4 Valid Normal User Login
  console.log('\n--- 2. LOGIN API (POST /api/auth/login) ---');
  const loginReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: testUserEmail,
    password: 'securePassword2026!',
  });
  const loginRes = await loginPOST(loginReq);
  const loginData = await loginRes.json();
  const userAuthCookie = loginRes.headers.get('set-cookie') || '';

  assert(loginRes.status === 200, 'POST /api/auth/login returns HTTP 200 OK for normal user');
  assert(loginData.success === true, 'Login response contains success: true');
  assert(loginData.user?.role === 'user', 'Login returns role: "user" for normal user');
  assert(loginData.user?.password === undefined, 'Login never exposes password');
  assert(userAuthCookie.includes('auth_token='), 'Login sets auth_token cookie');

  // 1.5 Valid Admin Login
  // Create an admin user for testing
  const seededAdmin = await User.create({
    name: 'Fleet Admiral E2E',
    email: testAdminEmail,
    password: 'AdminOnePiece2026!',
    role: 'admin',
  });
  const adminLoginReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: testAdminEmail,
    password: 'AdminOnePiece2026!',
  });
  const adminLoginRes = await loginPOST(adminLoginReq);
  const adminLoginData = await adminLoginRes.json();
  const adminAuthCookie = adminLoginRes.headers.get('set-cookie') || '';

  assert(adminLoginRes.status === 200, 'POST /api/auth/login returns HTTP 200 OK for admin');
  assert(adminLoginData.user?.role === 'admin', 'Login returns role: "admin" for admin account');

  // 1.6 Invalid Password Login
  const wrongPassReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: testUserEmail,
    password: 'wrongPassword!',
  });
  const wrongPassRes = await loginPOST(wrongPassReq);
  assert(wrongPassRes.status === 401, 'Login with invalid password returns HTTP 401 Unauthorized');

  // 1.7 Unknown Email Login
  const unknownEmailReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'unknown_ghost@strawhat.com',
    password: 'somePassword!',
  });
  const unknownEmailRes = await loginPOST(unknownEmailReq);
  assert(unknownEmailRes.status === 401, 'Login with unknown email returns HTTP 401 Unauthorized');

  // 1.8 Current User API (GET /api/auth/me)
  console.log('\n--- 3. CURRENT USER API (GET /api/auth/me) ---');
  const meUserReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET', undefined, userAuthCookie);
  const meUserRes = await meGET(meUserReq);
  const meUserData = await meUserRes.json();
  assert(meUserRes.status === 200, 'GET /api/auth/me returns HTTP 200 for authenticated user');
  assert(meUserData.user?.email === testUserEmail, 'Me returns user profile matching session');
  assert(meUserData.user?.role === 'user', 'Me returns user role');

  const meAdminReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET', undefined, adminAuthCookie);
  const meAdminRes = await meGET(meAdminReq);
  const meAdminData = await meAdminRes.json();
  assert(meAdminRes.status === 200, 'GET /api/auth/me returns HTTP 200 for authenticated admin');
  assert(meAdminData.user?.role === 'admin', 'Me returns admin role');

  const meUnauthReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET');
  const meUnauthRes = await meGET(meUnauthReq);
  assert(meUnauthRes.status === 401, 'GET /api/auth/me returns HTTP 401 for unauthenticated request');

  // 1.9 Logout API (POST /api/auth/logout)
  console.log('\n--- 4. LOGOUT API (POST /api/auth/logout) ---');
  const logoutRes = await logoutPOST();
  const logoutCookie = logoutRes.headers.get('set-cookie') || '';
  assert(logoutRes.status === 200, 'POST /api/auth/logout returns HTTP 200 OK');
  assert(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires='), 'Logout invalidates auth cookie with Max-Age=0');

  // ==========================================
  // 2. ADMIN AUTHORIZATION GUARDS
  // ==========================================
  console.log('\n--- 5. ADMIN AUTHORIZATION GUARDS (401, 403, 200) ---');
  const unauthAdminReq = createJsonRequest('http://localhost:3000/api/admin/users', 'GET');
  const unauthAdminRes = await adminUsersGET(unauthAdminReq);
  assert(unauthAdminRes.status === 401, 'Unauthenticated request to /api/admin/* returns HTTP 401');

  const userAdminReq = createJsonRequest('http://localhost:3000/api/admin/users', 'GET', undefined, userAuthCookie);
  const userAdminRes = await adminUsersGET(userAdminReq);
  assert(userAdminRes.status === 403, 'Normal user request to /api/admin/* returns HTTP 403 Forbidden');

  const validAdminReq = createJsonRequest('http://localhost:3000/api/admin/users', 'GET', undefined, adminAuthCookie);
  const validAdminRes = await adminUsersGET(validAdminReq);
  assert(validAdminRes.status === 200, 'Admin request to /api/admin/* is permitted with HTTP 200 OK');

  // ==========================================
  // 3. USER ADMIN APIs
  // ==========================================
  console.log('\n--- 6. USER ADMIN APIS (GET/PUT/DELETE /api/admin/users) ---');
  // 8. GET /api/admin/users
  const adminUsersData = await validAdminRes.json();
  assert(adminUsersData.success === true, 'GET /api/admin/users returns success: true');
  assert(Array.isArray(adminUsersData.users), 'GET /api/admin/users returns users array');

  // 9. GET /api/admin/users/[id]
  const targetUser = await User.findOne({ email: testUserEmail }).lean();
  const targetUserId = targetUser?._id.toString() || '';
  const getUserReq = createJsonRequest(`http://localhost:3000/api/admin/users/${targetUserId}`, 'GET', undefined, adminAuthCookie);
  const getUserRes = await adminUserDetailGET(getUserReq, { params: Promise.resolve({ id: targetUserId }) });
  const getUserData = await getUserRes.json();
  assert(getUserRes.status === 200, 'GET /api/admin/users/[id] returns HTTP 200');
  assert(getUserData.user?.email === testUserEmail, 'User detail matches target user');
  assert(getUserData.user?.password === undefined, 'User detail never contains password');

  // 10. PUT /api/admin/users/[id]
  const putUserReq = createJsonRequest(
    `http://localhost:3000/api/admin/users/${targetUserId}`,
    'PUT',
    { name: 'Updated Sailor Name', role: 'user' },
    adminAuthCookie
  );
  const putUserRes = await adminUserDetailPUT(putUserReq, { params: Promise.resolve({ id: targetUserId }) });
  const putUserData = await putUserRes.json();
  assert(putUserRes.status === 200, 'PUT /api/admin/users/[id] returns HTTP 200');
  assert(putUserData.user?.name === 'Updated Sailor Name', 'Updated name saved in user profile');

  // 11. DELETE /api/admin/users/[id]
  const delUserReq = createJsonRequest(`http://localhost:3000/api/admin/users/${targetUserId}`, 'DELETE', undefined, adminAuthCookie);
  const delUserRes = await adminUserDetailDELETE(delUserReq, { params: Promise.resolve({ id: targetUserId }) });
  assert(delUserRes.status === 200, 'DELETE /api/admin/users/[id] returns HTTP 200');

  // Self-deletion safeguard
  const adminId = seededAdmin._id.toString();
  const selfDelReq = createJsonRequest(`http://localhost:3000/api/admin/users/${adminId}`, 'DELETE', undefined, adminAuthCookie);
  const selfDelRes = await adminUserDetailDELETE(selfDelReq, { params: Promise.resolve({ id: adminId }) });
  assert(selfDelRes.status === 400, 'Admin self-deletion attempt rejected with HTTP 400');

  // ==========================================
  // 4. PRODUCT PUBLIC APIs
  // ==========================================
  console.log('\n--- 7. PUBLIC PRODUCT APIS (GET /api/products, search, sort, filters) ---');
  // 12. GET /api/products
  const prodListReq = createJsonRequest('http://localhost:3000/api/products', 'GET');
  const prodListRes = await productsListGET(prodListReq);
  const prodListData = await prodListRes.json();
  assert(prodListRes.status === 200, 'GET /api/products returns HTTP 200 OK');
  assert(prodListData.success === true, 'Public products list returns success: true');
  assert(Array.isArray(prodListData.products) && prodListData.products.length >= 7, 'Public products list returns full catalog');

  // 13. Search query (?q=luffy)
  const searchReq = createJsonRequest('http://localhost:3000/api/products?q=luffy', 'GET');
  const searchRes = await productsListGET(searchReq);
  const searchData = await searchRes.json();
  assert(searchRes.status === 200, 'GET /api/products?q=luffy returns HTTP 200');
  assert(searchData.products.length > 0, 'Search matches products');

  // 14. Crew filter (?crew=STRAW_HAT)
  const crewReq = createJsonRequest('http://localhost:3000/api/products?crew=STRAW_HAT', 'GET');
  const crewRes = await productsListGET(crewReq);
  const crewData = await crewRes.json();
  assert(crewRes.status === 200, 'GET /api/products?crew=STRAW_HAT returns HTTP 200');
  assert(crewData.products.every((p: { crew: string }) => p.crew === 'STRAW_HAT'), 'All crew filtered products belong to STRAW_HAT');

  // 15. Sort price_asc
  const sortAscReq = createJsonRequest('http://localhost:3000/api/products?sort=price_asc', 'GET');
  const sortAscRes = await productsListGET(sortAscReq);
  const sortAscData = await sortAscRes.json();
  const pricesAsc = sortAscData.products.map((p: { price: number }) => p.price);
  const isAsc = pricesAsc.every((p: number, i: number) => i === 0 || p >= pricesAsc[i - 1]);
  assert(isAsc, 'GET /api/products?sort=price_asc sorts price in ascending order');

  // 16. Sort price_desc
  const sortDescReq = createJsonRequest('http://localhost:3000/api/products?sort=price_desc', 'GET');
  const sortDescRes = await productsListGET(sortDescReq);
  const sortDescData = await sortDescRes.json();
  const pricesDesc = sortDescData.products.map((p: { price: number }) => p.price);
  const isDesc = pricesDesc.every((p: number, i: number) => i === 0 || p <= pricesDesc[i - 1]);
  assert(isDesc, 'GET /api/products?sort=price_desc sorts price in descending order');

  // 17. Sort gsm
  const sortGsmReq = createJsonRequest('http://localhost:3000/api/products?sort=gsm', 'GET');
  const sortGsmRes = await productsListGET(sortGsmReq);
  const sortGsmData = await sortGsmRes.json();
  const gsmDesc = sortGsmData.products.map((p: { gsm: number }) => p.gsm);
  const isGsmDesc = gsmDesc.every((g: number, i: number) => i === 0 || g <= gsmDesc[i - 1]);
  assert(isGsmDesc, 'GET /api/products?sort=gsm sorts fabric weight (GSM) highest first');

  // 18. Sort newest
  const sortNewReq = createJsonRequest('http://localhost:3000/api/products?sort=newest', 'GET');
  const sortNewRes = await productsListGET(sortNewReq);
  assert(sortNewRes.status === 200, 'GET /api/products?sort=newest returns HTTP 200');

  // 19. Single Product by Slug (GET /api/products/[slug])
  const singleSlug = 'sun-god-heavyweight-tee';
  const singleReq = createJsonRequest(`http://localhost:3000/api/products/${singleSlug}`, 'GET');
  const singleRes = await singleProductGET(singleReq, { params: Promise.resolve({ slug: singleSlug }) });
  const singleData = await singleRes.json();
  assert(singleRes.status === 200, 'GET /api/products/[slug] returns HTTP 200 for valid slug');
  assert(singleData.product?.slug === singleSlug, 'Product slug matches requested slug');

  // Custom ID fallback lookup
  const idFallbackReq = createJsonRequest('http://localhost:3000/api/products/nika-01', 'GET');
  const idFallbackRes = await singleProductGET(idFallbackReq, { params: Promise.resolve({ slug: 'nika-01' }) });
  const idFallbackData = await idFallbackRes.json();
  assert(idFallbackRes.status === 200, 'GET /api/products/[id] fallback returns HTTP 200');
  assert(idFallbackData.product?.id === 'nika-01', 'Product id matches requested ID');

  // ==========================================
  // 5. ADMIN PRODUCT APIs
  // ==========================================
  console.log('\n--- 8. ADMIN PRODUCT CRUD APIS ---');
  // 20. GET /api/admin/products
  const adminProdListReq = createJsonRequest('http://localhost:3000/api/admin/products', 'GET', undefined, adminAuthCookie);
  const adminProdListRes = await adminProductsGET(adminProdListReq);
  const adminProdListData = await adminProdListRes.json();
  assert(adminProdListRes.status === 200, 'GET /api/admin/products returns HTTP 200 for admin');
  assert(adminProdListData.success === true, 'Admin products list returns success: true');

  // 21. POST /api/admin/products (Create)
  const newProductPayload = {
    id: testProductId,
    slug: testProductSlug,
    name: 'E2E Sun God Liberation Jacket // 650 GSM Heavyweight',
    japaneseName: '太陽の神 解放ジャケット',
    crew: 'STRAW_HAT',
    character: 'Monkey D. Luffy',
    price: 135,
    compareAtPrice: 175,
    description: 'Ultra-heavyweight 650 GSM Japanese woven denim jacket.',
    story: 'Worn on the rooftop of Onigashima.',
    details: ['650 GSM Heavyweight Denim', 'Custom Metal Hardware'],
    gsm: 650,
    cut: 'Oversized Boxy Silhouette',
    fabric: '100% Japanese Combed Cotton Denim',
    color: 'Wano Indigo',
    colorHex: '#1B263B',
    colors: [{ name: 'Wano Indigo', hex: '#1B263B', image: '/images/test-jacket.jpg' }],
    sizes: ['M', 'L', 'XL'],
    stock: 18,
    images: ['/images/test-jacket.jpg'],
    tags: ['Heavyweight', 'Limited Edition', 'Denim'],
    isNewDrop: true,
    isLimited: true,
    isBestseller: true,
    editionNumber: '001 / 050',
  };
  const createProdReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', newProductPayload, adminAuthCookie);
  const createProdRes = await adminProductsPOST(createProdReq);
  const createProdData = await createProdRes.json();
  assert(createProdRes.status === 201, 'POST /api/admin/products returns HTTP 201 Created');
  assert(createProdData.product?.id === testProductId, 'Created product id matches payload');

  // Duplicate ID prevention (409)
  const dupIdReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', { ...newProductPayload, slug: 'another-unique-slug' }, adminAuthCookie);
  const dupIdRes = await adminProductsPOST(dupIdReq);
  assert(dupIdRes.status === 409, 'POST /api/admin/products with duplicate ID returns HTTP 409 Conflict');

  // Duplicate Slug prevention (409)
  const dupSlugReq = createJsonRequest('http://localhost:3000/api/admin/products', 'POST', { ...newProductPayload, id: 'another-unique-id' }, adminAuthCookie);
  const dupSlugRes = await adminProductsPOST(dupSlugReq);
  assert(dupSlugRes.status === 409, 'POST /api/admin/products with duplicate slug returns HTTP 409 Conflict');

  // 22. GET /api/admin/products/[id]
  const getAdminProdReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'GET', undefined, adminAuthCookie);
  const getAdminProdRes = await adminProductDetailGET(getAdminProdReq, { params: Promise.resolve({ id: testProductId }) });
  const getAdminProdData = await getAdminProdRes.json();
  assert(getAdminProdRes.status === 200, 'GET /api/admin/products/[id] returns HTTP 200');
  assert(getAdminProdData.product?.id === testProductId, 'Returned admin product matches ID');

  // 23. PUT /api/admin/products/[id]
  const updateProdReq = createJsonRequest(
    `http://localhost:3000/api/admin/products/${testProductId}`,
    'PUT',
    { price: 145, stock: 30 },
    adminAuthCookie
  );
  const updateProdRes = await adminProductDetailPUT(updateProdReq, { params: Promise.resolve({ id: testProductId }) });
  const updateProdData = await updateProdRes.json();
  assert(updateProdRes.status === 200, 'PUT /api/admin/products/[id] returns HTTP 200');
  assert(updateProdData.product?.price === 145, 'Updated price reflected in database response');

  // 24. DELETE /api/admin/products/[id]
  const delAdminProdReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'DELETE', undefined, adminAuthCookie);
  const delAdminProdRes = await adminProductDetailDELETE(delAdminProdReq, { params: Promise.resolve({ id: testProductId }) });
  assert(delAdminProdRes.status === 200, 'DELETE /api/admin/products/[id] returns HTTP 200');

  // 404 for deleted product
  const notFoundAdminProdReq = createJsonRequest(`http://localhost:3000/api/admin/products/${testProductId}`, 'GET', undefined, adminAuthCookie);
  const notFoundAdminProdRes = await adminProductDetailGET(notFoundAdminProdReq, { params: Promise.resolve({ id: testProductId }) });
  assert(notFoundAdminProdRes.status === 404, 'GET /api/admin/products/[id] for deleted product returns HTTP 404');

  // ==========================================
  // 6. DATABASE VERIFICATION
  // ==========================================
  console.log('\n--- 9. DATABASE & SECURITY AUDIT ---');
  const dbName = mongoose.connection.name;
  assert(dbName === 'onepiece_store', `Normal application connects to target database: "${dbName}"`);
  assert(dbName !== 'onepiece_store_test', 'Application does NOT use onepiece_store_test database');

  const dbProductsCount = await Product.countDocuments();
  assert(dbProductsCount >= 7, `MongoDB products collection is populated (Count: ${dbProductsCount})`);

  const dbUsersCount = await User.countDocuments();
  assert(dbUsersCount >= 1, `MongoDB users collection is populated (Count: ${dbUsersCount})`);

  // Verify stored passwords in DB are hashed with bcrypt
  const anyUser = await User.findOne({ email: testAdminEmail });
  assert(anyUser !== null, 'Test admin user exists');
  assert(Boolean(anyUser?.password?.startsWith('$2')), 'User password stored in DB is a bcrypt hash');

  // Cleanup test users
  await User.deleteMany({ email: { $in: [testUserEmail, testAdminEmail] } });

  console.log(`\n======================================================`);
  console.log(`FINAL E2E VERIFICATION: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFinalBackendVerification().catch((err) => {
  console.error('Fatal error during Phase 3.0 verification:', err);
  process.exit(1);
});
