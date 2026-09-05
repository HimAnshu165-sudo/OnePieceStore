import connectToDatabase from '../lib/mongodb';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { createToken } from '../lib/auth';
import { GET as getOrders, POST as createOrder } from '../app/api/orders/route';
import { GET as getAdminOrders } from '../app/api/admin/orders/route';
import { PATCH as patchAdminOrder } from '../app/api/admin/orders/[id]/route';
import { GET as getAuthMe, PUT as putAuthMe } from '../app/api/auth/me/route';
import { NextRequest } from 'next/server';

function createMockRequest(
  url: string,
  method: string = 'GET',
  token?: string,
  body?: any
): NextRequest {
  const headers = new Headers();
  headers.set('host', 'localhost:3000');
  if (token) {
    headers.set('cookie', `auth_token=${token}`);
    headers.set('authorization', `Bearer ${token}`);
  }
  if (body) {
    headers.set('content-type', 'application/json');
  }

  const reqInit: RequestInit = {
    method,
    headers,
  };

  if (body) {
    reqInit.body = JSON.stringify(body);
  }

  return new NextRequest(new Request(url, reqInit));
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runVerification() {
  console.log('\n===============================================================');
  console.log('   ORDERS & REAL-TIME DASHBOARD SYNC VERIFICATION');
  console.log('===============================================================\n');

  await connectToDatabase();
  console.log('Connected to MongoDB.\n');

  const testUserEmail = `test-user-${Date.now()}@onepiece-store.com`;

  // 1. Create a fresh test user
  const newUser = await User.create({
    name: 'New Pirate Recruit',
    email: testUserEmail,
    password: 'RecruitPassword2026!',
    role: 'user',
  });

  const userToken = createToken({
    userId: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  // Admin token
  const adminUser = await User.findOne({ role: 'admin' });
  const adminToken = createToken({
    userId: adminUser ? adminUser._id.toString() : 'admin-01',
    email: adminUser ? adminUser.email : 'admin@onepiece-store.com',
    role: 'admin',
    name: 'Fleet Admiral',
  });

  console.log('--- TEST STEP 1: Freshly created user has ZERO orders ---');
  const getOrdersReq = createMockRequest('http://localhost:3000/api/orders', 'GET', userToken);
  const getOrdersRes = await getOrders(getOrdersReq);
  const getOrdersData = await getOrdersRes.json();
  assert(getOrdersRes.status === 200, 'GET /api/orders returns HTTP 200');
  assert(Array.isArray(getOrdersData.orders), 'GET /api/orders returns orders array');
  assert(getOrdersData.orders.length === 0, 'Freshly created user has exactly 0 orders in database');

  console.log('\n--- TEST STEP 2: Freshly created user profile in MongoDB has empty addresses ---');
  const getMeReq = createMockRequest('http://localhost:3000/api/auth/me', 'GET', userToken);
  const getMeRes = await getAuthMe(getMeReq);
  const getMeData = await getMeRes.json();
  assert(getMeRes.status === 200, 'GET /api/auth/me returns HTTP 200');
  assert(getMeData.user.email === testUserEmail, 'GET /api/auth/me returns correct user email');
  assert(getMeData.user.addresses.length === 0, 'Freshly created user has exactly 0 addresses');

  console.log('\n--- TEST STEP 3: User places a new order via POST /api/orders ---');
  const orderId = `GL-${Math.floor(100000 + Math.random() * 900000)}-SHIN`;
  const orderPayload = {
    id: orderId,
    orderId,
    customerName: 'New Pirate Recruit',
    items: [
      {
        product: {
          id: 'luffy-sun-god-tee',
          slug: 'luffy-sun-god-heavyweight-tee',
          name: 'Sun God Nika // Gear 5 Heavyweight Tee',
          price: 95,
          image: '/images/luffy-sun-god.jpg',
        },
        selectedSize: 'XL',
        selectedColor: 'Sun Gold',
        quantity: 2,
      },
    ],
    subtotal: 190,
    discount: 0,
    shippingCost: 0,
    total: 190,
    shippingAddress: {
      address: 'Thousand Sunny Main Deck 1',
      city: 'Water 7',
      state: 'Grand Line',
      postalCode: '999-0001',
      country: 'Japan',
    },
  };

  const createOrderReq = createMockRequest('http://localhost:3000/api/orders', 'POST', userToken, orderPayload);
  const createOrderRes = await createOrder(createOrderReq);
  const createOrderData = await createOrderRes.json();
  assert(createOrderRes.status === 201, 'POST /api/orders returns HTTP 201 Created');
  assert(createOrderData.success === true, 'Order created with success: true');
  assert(createOrderData.order.id === orderId, `Created order ID matches "${orderId}"`);

  console.log('\n--- TEST STEP 4: User now sees EXACTLY 1 order in /api/orders ---');
  const userOrdersAfterReq = createMockRequest('http://localhost:3000/api/orders', 'GET', userToken);
  const userOrdersAfterRes = await getOrders(userOrdersAfterReq);
  const userOrdersAfterData = await userOrdersAfterRes.json();
  assert(userOrdersAfterData.orders.length === 1, 'User orders list now contains exactly 1 order');
  assert(userOrdersAfterData.orders[0].id === orderId, 'Retrieved order ID matches placed order');
  assert(userOrdersAfterData.orders[0].orderStatus === 'Processing', 'Initial order status is "Processing"');

  console.log('\n--- TEST STEP 5: Admin sees the newly placed order in /api/admin/orders ---');
  const adminOrdersReq = createMockRequest('http://localhost:3000/api/admin/orders', 'GET', adminToken);
  const adminOrdersRes = await getAdminOrders(adminOrdersReq);
  const adminOrdersData = await adminOrdersRes.json();
  assert(adminOrdersRes.status === 200, 'GET /api/admin/orders returns HTTP 200');
  const foundInAdmin = adminOrdersData.orders.find((o: any) => o.id === orderId);
  assert(!!foundInAdmin, `Admin orders queue contains new order "${orderId}"`);

  console.log('\n--- TEST STEP 6: Admin updates order status to "Shipped" ---');
  const patchReq = createMockRequest(
    `http://localhost:3000/api/admin/orders/${orderId}`,
    'PATCH',
    adminToken,
    { orderStatus: 'Shipped', trackingNumber: 'JP-EXP-999888777' }
  );
  const patchRes = await patchAdminOrder(patchReq, { params: Promise.resolve({ id: orderId }) });
  const patchData = await patchRes.json();
  assert(patchRes.status === 200, 'PATCH /api/admin/orders/:id returns HTTP 200');
  assert(patchData.order.orderStatus === 'Shipped', 'Order status updated to "Shipped" in MongoDB');

  console.log('\n--- TEST STEP 7: User real-time check sees updated "Shipped" status ---');
  const userCheckReq = createMockRequest('http://localhost:3000/api/orders', 'GET', userToken);
  const userCheckRes = await getOrders(userCheckReq);
  const userCheckData = await userCheckRes.json();
  const updatedUserOrder = userCheckData.orders.find((o: any) => o.id === orderId);
  assert(updatedUserOrder?.orderStatus === 'Shipped', 'User order reflects "Shipped" status in real time');

  console.log('\n--- TEST STEP 8: User updates profile & adds shipping address to MongoDB ---');
  const putProfileReq = createMockRequest('http://localhost:3000/api/auth/me', 'PUT', userToken, {
    phone: '+81 90-8888-7777',
    city: 'Wano Kuni',
    addresses: [
      {
        id: 'addr-wano-01',
        title: 'Flower Capital Manor',
        fullName: 'New Pirate Recruit',
        phone: '+81 90-8888-7777',
        addressLine: 'Kuri District 4-10',
        city: 'Wano Kuni',
        state: 'Wano',
        postalCode: '888-0001',
        country: 'Japan',
        isDefault: true,
      },
    ],
  });
  const putProfileRes = await putAuthMe(putProfileReq);
  const putProfileData = await putProfileRes.json();
  assert(putProfileRes.status === 200, 'PUT /api/auth/me returns HTTP 200');
  assert(putProfileData.user.city === 'Wano Kuni', 'User city persisted in MongoDB');
  assert(putProfileData.user.addresses.length === 1, 'User address persisted in MongoDB');

  // Clean up test order and user
  await Order.deleteOne({ id: orderId });
  await User.deleteOne({ _id: newUser._id });

  console.log('\n===============================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('===============================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
