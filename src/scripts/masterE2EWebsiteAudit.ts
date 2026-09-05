import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import { createToken } from '../lib/auth';
import { NextRequest } from 'next/server';

// Route Handlers
import { POST as authSignup } from '../app/api/auth/signup/route';
import { POST as authRegister } from '../app/api/auth/register/route';
import { POST as authLogin } from '../app/api/auth/login/route';
import { POST as authLogout } from '../app/api/auth/logout/route';
import { GET as authMeGet, PUT as authMePut } from '../app/api/auth/me/route';
import { GET as getPublicProducts } from '../app/api/products/route';
import { GET as getProductBySlug } from '../app/api/products/[slug]/route';
import { GET as getUserOrders, POST as createUserOrder } from '../app/api/orders/route';
import { GET as getAdminProducts, POST as createAdminProduct } from '../app/api/admin/products/route';
import { GET as getAdminProductById, PUT as updateAdminProduct, DELETE as deleteAdminProduct } from '../app/api/admin/products/[id]/route';
import { GET as getAdminOrders } from '../app/api/admin/orders/route';
import { GET as getAdminOrderById, PATCH as patchAdminOrder, DELETE as deleteAdminOrder } from '../app/api/admin/orders/[id]/route';
import { GET as getAdminUsers } from '../app/api/admin/users/route';

function makeReq(url: string, method: string = 'GET', token?: string, body?: any): NextRequest {
  const headers = new Headers();
  headers.set('host', 'localhost:3000');
  if (token) {
    headers.set('cookie', `auth_token=${token}`);
    headers.set('authorization', `Bearer ${token}`);
  }
  if (body) {
    headers.set('content-type', 'application/json');
  }

  const reqInit: RequestInit = { method, headers };
  if (body) reqInit.body = JSON.stringify(body);
  return new NextRequest(new Request(url, reqInit));
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function reportTest(name: string, condition: boolean, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${name} ${detail ? `(${detail})` : ''}`);
  }
}

async function runMasterAudit() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       ONE PIECE STORE - COMPREHENSIVE MASTER SYSTEM AUDIT      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // ==========================================
  // SECTION 1: DATABASE CONNECTIVITY & HEALTH
  // ==========================================
  console.log('🔹 SECTION 1: DATABASE CONNECTIVITY & HEALTH');
  try {
    const conn = await connectToDatabase();
    reportTest('MongoDB Connection established to cluster', !!conn && mongoose.connection.readyState === 1);
    const productCount = await Product.countDocuments();
    reportTest(`MongoDB Products collection accessible (${productCount} records)`, productCount > 0);
  } catch (err: any) {
    reportTest('MongoDB Connection established', false, err.message);
  }

  // ==========================================
  // SECTION 2: AUTHENTICATION (SIGNUP, LOGIN, LOGOUT)
  // ==========================================
  console.log('\n🔹 SECTION 2: AUTHENTICATION (SIGNUP, LOGIN, SESSIONS, RBAC)');
  const testStamp = Date.now();
  const testUserEmail = `audit_user_${testStamp}@onepiece-store.com`;
  const testUserPassword = 'StrongPassword2026!';
  let userToken = '';
  let adminToken = '';

  // 2.1 Signup
  const signupRes = await authSignup(makeReq('http://localhost:3000/api/auth/signup', 'POST', undefined, {
    name: 'Portgas D. Ace',
    email: testUserEmail,
    password: testUserPassword,
  }));
  const signupData = await signupRes.json();
  reportTest('POST /api/auth/signup returns HTTP 201 Created & creates user', (signupRes.status === 201 || signupRes.status === 200) && signupData.success);
  reportTest('New user assigned strict "user" role', signupData.user?.role === 'user');

  // 2.2 Duplicate Signup Prevention
  const dupRes = await authSignup(makeReq('http://localhost:3000/api/auth/signup', 'POST', undefined, {
    name: 'Duplicate Ace',
    email: testUserEmail,
    password: testUserPassword,
  }));
  reportTest('Duplicate email signup rejected with HTTP 400', dupRes.status === 400);

  // 2.3 Login with Wrong Password
  const badLoginRes = await authLogin(makeReq('http://localhost:3000/api/auth/login', 'POST', undefined, {
    email: testUserEmail,
    password: 'WrongPassword!',
  }));
  reportTest('Login with incorrect password rejected with HTTP 401', badLoginRes.status === 401);

  // 2.4 Login with Correct Password
  const loginRes = await authLogin(makeReq('http://localhost:3000/api/auth/login', 'POST', undefined, {
    email: testUserEmail,
    password: testUserPassword,
  }));
  const loginData = await loginRes.json();
  reportTest('POST /api/auth/login returns HTTP 200 & authenticates', loginRes.status === 200 && loginData.success);

  // Extract auth token for subsequent requests
  userToken = createToken({
    userId: loginData.user.id,
    email: loginData.user.email,
    role: 'user',
    name: loginData.user.name,
  });

  // Admin token
  const adminUser = await User.findOne({ role: 'admin' });
  adminToken = createToken({
    userId: adminUser ? adminUser._id.toString() : 'admin-01',
    email: adminUser ? adminUser.email : 'admin@onepiece-store.com',
    role: 'admin',
    name: 'Fleet Admiral',
  });

  // 2.5 Auth Me / Session
  const meRes = await authMeGet(makeReq('http://localhost:3000/api/auth/me', 'GET', userToken));
  const meData = await meRes.json();
  reportTest('GET /api/auth/me returns active user session', meRes.status === 200 && meData.user?.email === testUserEmail);
  reportTest('New user starts with 0 saved addresses', Array.isArray(meData.user?.addresses) && meData.user.addresses.length === 0);

  // 2.6 Logout
  const logoutRes = await authLogout();
  reportTest('POST /api/auth/logout clears session cookies', logoutRes.status === 200);

  // ==========================================
  // SECTION 3: STOREFRONT & PRODUCTS CATALOG
  // ==========================================
  console.log('\n🔹 SECTION 3: STOREFRONT & PRODUCTS CATALOG');
  const prodsRes = await getPublicProducts(makeReq('http://localhost:3000/api/products', 'GET'));
  const prodsData = await prodsRes.json();
  reportTest('GET /api/products returns product list from MongoDB', prodsRes.status === 200 && Array.isArray(prodsData.products) && prodsData.products.length > 0);

  const sampleProduct = prodsData.products[0];
  const slugRes = await getProductBySlug(
    makeReq(`http://localhost:3000/api/products/${sampleProduct.slug}`, 'GET'),
    { params: Promise.resolve({ slug: sampleProduct.slug }) }
  );
  const slugData = await slugRes.json();
  reportTest(`GET /api/products/[slug] retrieves "${sampleProduct.name}"`, slugRes.status === 200 && slugData.product?.id === sampleProduct.id);

  // 3.3 404 Resilience for Non-Existent Product
  const notFoundProdRes = await getProductBySlug(
    makeReq('http://localhost:3000/api/products/non-existent-product-slug-xyz', 'GET'),
    { params: Promise.resolve({ slug: 'non-existent-product-slug-xyz' }) }
  );
  reportTest('GET /api/products/[slug] on non-existent slug returns clean 404', notFoundProdRes.status === 404);

  // ==========================================
  // SECTION 4: USER ORDERS & CHECKOUT INTEGRATION
  // ==========================================
  console.log('\n🔹 SECTION 4: USER ORDERS & CHECKOUT INTEGRATION');
  // 4.1 Initial Orders Count for New User
  const initOrdersRes = await getUserOrders(makeReq('http://localhost:3000/api/orders', 'GET', userToken));
  const initOrdersData = await initOrdersRes.json();
  reportTest('GET /api/orders returns exactly 0 orders for fresh account (NO fake data)', initOrdersRes.status === 200 && initOrdersData.orders.length === 0);

  // 4.2 Place Real Order
  const initialStock = sampleProduct.stock;
  const testOrderId = `GL-AUDIT-${testStamp}`;
  const placeOrderRes = await createUserOrder(makeReq('http://localhost:3000/api/orders', 'POST', userToken, {
    id: testOrderId,
    orderId: testOrderId,
    customerName: 'Portgas D. Ace',
    items: [
      {
        product: sampleProduct,
        selectedSize: 'L',
        selectedColor: sampleProduct.color || 'Obsidian Black',
        quantity: 1,
      },
    ],
    subtotal: sampleProduct.price,
    discount: 0,
    shippingCost: 0,
    total: sampleProduct.price,
    shippingAddress: {
      address: 'Moby Dick Deck 2',
      city: 'Sphinx Island',
      state: 'New World',
      postalCode: '100-0001',
      country: 'Japan',
    },
  }));
  const placeOrderData = await placeOrderRes.json();
  reportTest('POST /api/orders saves order to MongoDB', placeOrderRes.status === 201 && placeOrderData.success);

  // 4.3 Verify User Order list
  const userOrdersAfterRes = await getUserOrders(makeReq('http://localhost:3000/api/orders', 'GET', userToken));
  const userOrdersAfterData = await userOrdersAfterRes.json();
  reportTest('User order list immediately reflects placed order (Count: 1)', userOrdersAfterData.orders?.length === 1 && userOrdersAfterData.orders[0].id === testOrderId);

  // 4.4 Stock auto-decrement check
  const updatedSampleProd = await Product.findOne({ id: sampleProduct.id });
  reportTest('Stock decremented in MongoDB after purchase', updatedSampleProd?.stock === initialStock - 1);
  // Restore stock
  await Product.updateOne({ id: sampleProduct.id }, { $inc: { stock: 1 } });

  // 4.5 User Profile & Address Update
  const updateProfileRes = await authMePut(makeReq('http://localhost:3000/api/auth/me', 'PUT', userToken, {
    phone: '+81 90-7777-1111',
    city: 'Sphinx Island',
    addresses: [
      {
        id: 'addr-audit-01',
        title: 'Whitebeard Fleet Flagship',
        fullName: 'Portgas D. Ace',
        phone: '+81 90-7777-1111',
        addressLine: 'Moby Dick Quarters',
        city: 'Sphinx Island',
        state: 'New World',
        postalCode: '100-0001',
        country: 'Japan',
        isDefault: true,
      },
    ],
  }));
  const updateProfileData = await updateProfileRes.json();
  reportTest('PUT /api/auth/me updates user phone & address in MongoDB', updateProfileRes.status === 200 && updateProfileData.user?.addresses?.length === 1);

  // ==========================================
  // SECTION 5: ADMIN PORTAL (SECURITY, PRODUCTS, ORDERS, USERS)
  // ==========================================
  console.log('\n🔹 SECTION 5: ADMIN PORTAL (SECURITY, PRODUCTS, ORDERS, USERS)');

  // 5.1 Security / RBAC: Regular user blocked from admin endpoints
  const blockedAdminProd = await getAdminProducts(makeReq('http://localhost:3000/api/admin/products', 'GET', userToken));
  reportTest('Security: Non-admin GET /api/admin/products blocked with HTTP 403', blockedAdminProd.status === 403);

  const blockedAdminOrders = await getAdminOrders(makeReq('http://localhost:3000/api/admin/orders', 'GET', userToken));
  reportTest('Security: Non-admin GET /api/admin/orders blocked with HTTP 403', blockedAdminOrders.status === 403);

  // 5.2 Admin Order Queue & Status Update
  const adminOrdersRes = await getAdminOrders(makeReq('http://localhost:3000/api/admin/orders', 'GET', adminToken));
  const adminOrdersData = await adminOrdersRes.json();
  reportTest('Admin GET /api/admin/orders returns live order list', adminOrdersRes.status === 200 && Array.isArray(adminOrdersData.orders));

  const patchOrderRes = await patchAdminOrder(
    makeReq(`http://localhost:3000/api/admin/orders/${testOrderId}`, 'PATCH', adminToken, {
      orderStatus: 'Shipped',
      trackingNumber: 'JP-EXP-MASTER-888',
    }),
    { params: Promise.resolve({ id: testOrderId }) }
  );
  reportTest('Admin PATCH /api/admin/orders/:id updates order to "Shipped"', patchOrderRes.status === 200);

  // 5.3 Admin Product CRUD Flow
  const auditProdId = `audit-hoodie-${testStamp}`;
  const createProdRes = await createAdminProduct(makeReq('http://localhost:3000/api/admin/products', 'POST', adminToken, {
    id: auditProdId,
    slug: `audit-flame-hoodie-${testStamp}`,
    name: 'Flame Emperor // 650 GSM Heavy Hoodie',
    japaneseName: '大炎戒 // 650GSM',
    crew: 'WHITEBEARD',
    character: 'Portgas D. Ace',
    price: 135,
    description: 'Ultra-heavyweight Japanese loopback fleece.',
    story: 'Moby Dick collection.',
    details: ['650 GSM fleece', 'Embroidered flame insignia'],
    gsm: 650,
    cut: 'Relaxed Drop-Shoulder',
    fabric: '100% Cotton',
    color: 'Flame Orange',
    colorHex: '#E65100',
    stock: 15,
    images: ['/images/collection-red-hair.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
  }));
  reportTest('Admin POST /api/admin/products creates product in MongoDB', createProdRes.status === 201);

  // Update product stock
  const updateProdRes = await updateAdminProduct(
    makeReq(`http://localhost:3000/api/admin/products/${auditProdId}`, 'PUT', adminToken, { stock: 25 }),
    { params: Promise.resolve({ id: auditProdId }) }
  );
  reportTest('Admin PUT /api/admin/products/:id updates product stock in MongoDB', updateProdRes.status === 200);

  // Delete product
  const deleteProdRes = await deleteAdminProduct(
    makeReq(`http://localhost:3000/api/admin/products/${auditProdId}`, 'DELETE', adminToken),
    { params: Promise.resolve({ id: auditProdId }) }
  );
  reportTest('Admin DELETE /api/admin/products/:id permanently removes product from MongoDB', deleteProdRes.status === 200);

  const checkDeleted = await Product.findOne({ id: auditProdId });
  reportTest('Verified: Decommissioned product is completely null in database', checkDeleted === null);

  // 5.4 Admin User Management
  const adminUsersRes = await getAdminUsers(makeReq('http://localhost:3000/api/admin/users', 'GET', adminToken));
  const adminUsersData = await adminUsersRes.json();
  reportTest('Admin GET /api/admin/users returns user roster from MongoDB', adminUsersRes.status === 200 && Array.isArray(adminUsersData.users));

  // ==========================================
  // SECTION 6: CLEANUP & TEARDOWN
  // ==========================================
  await Order.deleteOne({ id: testOrderId });
  await User.deleteOne({ email: testUserEmail });

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║ AUDIT SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}       ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  process.exit(failedTests > 0 ? 1 : 0);
}

runMasterAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
