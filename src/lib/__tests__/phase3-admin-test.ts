import { GET as adminUsersGET } from '../../app/api/admin/users/route';
import {
  GET as adminUserDetailGET,
  PUT as adminUserDetailPUT,
  DELETE as adminUserDetailDELETE,
} from '../../app/api/admin/users/[id]/route';
import { NextRequest } from 'next/server';
import User from '../../models/User';
import { createToken, hashPassword } from '../../lib/auth';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'super_secret_jwt_for_phase3_testing_2026';
process.env.MONGODB_URI = 'mongodb://localhost:27017/onepiece_store_test';

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

interface MockStoredUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  _rawPassword?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<MockStoredUser>;
}

// In-memory mock database store for testing route handlers
const mockUserStore: Map<string, MockStoredUser> = new Map();

function setupMocks() {
  // Mock global.mongooseCache so connectToDatabase resolves immediately
  global.mongooseCache = { conn: {} as typeof mongoose, promise: Promise.resolve({} as typeof mongoose) };

  // Mock User.find
  User.find = (() => {
    return {
      sort: () => {
        return Array.from(mockUserStore.values());
      },
    };
  }) as unknown as typeof User.find;

  // Mock User.findOne
  User.findOne = (async (query: { email?: string; _id?: { $ne: string } }) => {
    const email = query?.email?.toLowerCase();
    const excludeId = query?._id?.$ne;
    for (const u of mockUserStore.values()) {
      if (excludeId && u._id === excludeId) continue;
      if (email && u.email.toLowerCase() === email) {
        return u;
      }
    }
    return null;
  }) as unknown as typeof User.findOne;

  // Mock User.findById
  User.findById = (async (id: string) => {
    const u = mockUserStore.get(id);
    if (!u) return null;
    return u;
  }) as unknown as typeof User.findById;

  // Mock User.findByIdAndDelete
  User.findByIdAndDelete = (async (id: string) => {
    const u = mockUserStore.get(id);
    if (!u) return null;
    mockUserStore.delete(id);
    return u;
  }) as unknown as typeof User.findByIdAndDelete;
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

async function runPhase3Tests() {
  setupMocks();

  console.log('\n======================================================');
  console.log('   PHASE 3 ADMIN & USER MANAGEMENT TEST SUITE');
  console.log('======================================================\n');

  // Seed initial test users in mock store
  const adminId = '507f1f77bcf86cd799439011';
  const userId1 = '507f1f77bcf86cd799439012';
  const userId2 = '507f1f77bcf86cd799439013';

  const mockAdmin: MockStoredUser = {
    _id: adminId,
    name: 'Fleet Admiral Sakazuki',
    email: 'akainu@marine.gov',
    password: await hashPassword('magma_absolute_justice'),
    role: 'admin',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    save: async function () {
      this.updatedAt = new Date();
      return this;
    },
  };

  const mockUser1: MockStoredUser = {
    _id: userId1,
    name: 'Monkey D. Luffy',
    email: 'luffy@strawhat.com',
    password: await hashPassword('gear5liberation'),
    role: 'user',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02'),
    save: async function () {
      this.updatedAt = new Date();
      return this;
    },
  };

  const mockUser2: MockStoredUser = {
    _id: userId2,
    name: 'Roronoa Zoro',
    email: 'zoro@strawhat.com',
    password: await hashPassword('santoryu_slash'),
    role: 'user',
    createdAt: new Date('2026-01-03'),
    updatedAt: new Date('2026-01-03'),
    save: async function () {
      this.updatedAt = new Date();
      return this;
    },
  };

  mockUserStore.set(adminId, mockAdmin);
  mockUserStore.set(userId1, mockUser1);
  mockUserStore.set(userId2, mockUser2);

  // Generate tokens
  const adminToken = createToken({
    userId: adminId,
    email: mockAdmin.email,
    role: 'admin',
    name: mockAdmin.name,
  });

  const userToken = createToken({
    userId: userId1,
    email: mockUser1.email,
    role: 'user',
    name: mockUser1.name,
  });

  console.log('--- 1. ADMIN AUTHORIZATION GUARDS (401, 403, 200) ---');

  // Case 1: Unauthenticated request to GET /api/admin/users -> 401
  const unauthReq = createJsonRequest('http://localhost:3000/api/admin/users', 'GET');
  const unauthRes = await adminUsersGET(unauthReq);
  assert(unauthRes.status === 401, 'Unauthenticated access to /api/admin/users rejected with HTTP 401');

  // Case 2: Normal user request to GET /api/admin/users -> 403
  const userReq = createJsonRequest('http://localhost:3000/api/admin/users', 'GET', undefined, `auth_token=${userToken}`);
  const userRes = await adminUsersGET(userReq);
  assert(userRes.status === 403, 'Regular user (role: "user") access to /api/admin/users rejected with HTTP 403 Forbidden');

  // Case 3: Admin request to GET /api/admin/users -> 200
  const adminReq = createJsonRequest('http://localhost:3000/api/admin/users', 'GET', undefined, `auth_token=${adminToken}`);
  const adminRes = await adminUsersGET(adminReq);
  const adminData = await adminRes.json();
  assert(adminRes.status === 200, 'Admin (role: "admin") access to /api/admin/users succeeds with HTTP 200');
  assert(adminData.success === true && Array.isArray(adminData.users), 'Admin users list returns success: true and users array');
  assert(adminData.users.length === 3, 'Admin users list contains all registered users');
  assert(adminData.users[0].password === undefined, 'Admin users list never includes password or password hashes');

  console.log('\n--- 2. GET SINGLE USER (GET /api/admin/users/:id) ---');

  // Valid ID fetch
  const getSingleReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId1}`, 'GET', undefined, `auth_token=${adminToken}`);
  const getSingleRes = await adminUserDetailGET(getSingleReq, { params: Promise.resolve({ id: userId1 }) });
  const getSingleData = await getSingleRes.json();
  assert(getSingleRes.status === 200, 'GET /api/admin/users/:id returns HTTP 200 for valid user ID');
  assert(getSingleData.user?.email === 'luffy@strawhat.com', 'GET /api/admin/users/:id returns correct user details');
  assert(getSingleData.user?.password === undefined, 'GET /api/admin/users/:id never exposes password');

  // Non-existing user ID
  const notFoundId = '507f1f77bcf86cd799439099';
  const getNotFoundReq = createJsonRequest(`http://localhost:3000/api/admin/users/${notFoundId}`, 'GET', undefined, `auth_token=${adminToken}`);
  const getNotFoundRes = await adminUserDetailGET(getNotFoundReq, { params: Promise.resolve({ id: notFoundId }) });
  assert(getNotFoundRes.status === 404, 'GET /api/admin/users/:id returns HTTP 404 for non-existing user');

  // Invalid ObjectId format
  const invalidIdReq = createJsonRequest('http://localhost:3000/api/admin/users/not-a-valid-id', 'GET', undefined, `auth_token=${adminToken}`);
  const invalidIdRes = await adminUserDetailGET(invalidIdReq, { params: Promise.resolve({ id: 'not-a-valid-id' }) });
  assert(invalidIdRes.status === 400, 'GET /api/admin/users/:id returns HTTP 400 for invalid ObjectId format');

  // Regular user blocked on GET /api/admin/users/:id -> 403
  const userDetailReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId1}`, 'GET', undefined, `auth_token=${userToken}`);
  const userDetailRes = await adminUserDetailGET(userDetailReq, { params: Promise.resolve({ id: userId1 }) });
  assert(userDetailRes.status === 403, 'Regular user blocked from GET /api/admin/users/:id with 403 Forbidden');

  console.log('\n--- 3. UPDATE USER (PUT /api/admin/users/:id) ---');

  // Valid update: Name, Role promotion to 'admin'
  const updateReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId1}`, 'PUT', {
    name: 'Emperor Luffy',
    role: 'admin',
    password: 'hacked_password_attempt', // Must be ignored!
  }, `auth_token=${adminToken}`);
  const updateRes = await adminUserDetailPUT(updateReq, { params: Promise.resolve({ id: userId1 }) });
  const updateData = await updateRes.json();

  assert(updateRes.status === 200, 'PUT /api/admin/users/:id updates user successfully with HTTP 200');
  assert(updateData.user?.name === 'Emperor Luffy', 'PUT /api/admin/users/:id updates user name');
  assert(updateData.user?.role === 'admin', 'PUT /api/admin/users/:id updates user role to admin');
  assert(mockUserStore.get(userId1)?.password !== 'hacked_password_attempt', 'PUT /api/admin/users/:id strictly prevents password tampering');

  // Duplicate email check
  const dupEmailReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId1}`, 'PUT', {
    email: 'zoro@strawhat.com', // Already used by mockUser2
  }, `auth_token=${adminToken}`);
  const dupEmailRes = await adminUserDetailPUT(dupEmailReq, { params: Promise.resolve({ id: userId1 }) });
  assert(dupEmailRes.status === 409, 'PUT /api/admin/users/:id returns HTTP 409 when email is already in use by another user');

  // Invalid role check
  const invalidRoleReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId1}`, 'PUT', {
    role: 'superadmin', // Invalid role
  }, `auth_token=${adminToken}`);
  const invalidRoleRes = await adminUserDetailPUT(invalidRoleReq, { params: Promise.resolve({ id: userId1 }) });
  assert(invalidRoleRes.status === 400, 'PUT /api/admin/users/:id rejects invalid role string with HTTP 400');

  // Non-existing user update -> 404
  const updateNotFoundReq = createJsonRequest(`http://localhost:3000/api/admin/users/${notFoundId}`, 'PUT', {
    name: 'Ghost User',
  }, `auth_token=${adminToken}`);
  const updateNotFoundRes = await adminUserDetailPUT(updateNotFoundReq, { params: Promise.resolve({ id: notFoundId }) });
  assert(updateNotFoundRes.status === 404, 'PUT /api/admin/users/:id returns HTTP 404 for non-existing user');

  // Regular user blocked on PUT -> 403
  const userPutReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId2}`, 'PUT', {
    role: 'admin',
  }, `auth_token=${userToken}`);
  const userPutRes = await adminUserDetailPUT(userPutReq, { params: Promise.resolve({ id: userId2 }) });
  assert(userPutRes.status === 403, 'Regular user blocked from PUT /api/admin/users/:id with 403 Forbidden');

  console.log('\n--- 4. DELETE USER (DELETE /api/admin/users/:id) ---');

  // Self-deletion attempt by authenticated admin -> must be rejected (400)
  const selfDeleteReq = createJsonRequest(`http://localhost:3000/api/admin/users/${adminId}`, 'DELETE', undefined, `auth_token=${adminToken}`);
  const selfDeleteRes = await adminUserDetailDELETE(selfDeleteReq, { params: Promise.resolve({ id: adminId }) });
  const selfDeleteData = await selfDeleteRes.json();
  assert(selfDeleteRes.status === 400, 'DELETE /api/admin/users/:id rejects self-deletion with HTTP 400');
  assert(selfDeleteData.error === 'You cannot delete your own admin account', 'DELETE self-deletion returns descriptive safeguard message');
  assert(mockUserStore.has(adminId) === true, 'Admin account remains intact in database');

  // Delete other user -> 200
  const deleteOtherReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId2}`, 'DELETE', undefined, `auth_token=${adminToken}`);
  const deleteOtherRes = await adminUserDetailDELETE(deleteOtherReq, { params: Promise.resolve({ id: userId2 }) });
  const deleteOtherData = await deleteOtherRes.json();
  assert(deleteOtherRes.status === 200, 'DELETE /api/admin/users/:id deletes target user with HTTP 200');
  assert(deleteOtherData.success === true, 'DELETE returns success: true');
  assert(mockUserStore.has(userId2) === false, 'Deleted user removed from database');

  // Delete non-existing user -> 404
  const deleteNotFoundReq = createJsonRequest(`http://localhost:3000/api/admin/users/${notFoundId}`, 'DELETE', undefined, `auth_token=${adminToken}`);
  const deleteNotFoundRes = await adminUserDetailDELETE(deleteNotFoundReq, { params: Promise.resolve({ id: notFoundId }) });
  assert(deleteNotFoundRes.status === 404, 'DELETE /api/admin/users/:id returns HTTP 404 for non-existing user');

  // Regular user blocked on DELETE -> 403
  const userDeleteReq = createJsonRequest(`http://localhost:3000/api/admin/users/${userId1}`, 'DELETE', undefined, `auth_token=${userToken}`);
  const userDeleteRes = await adminUserDetailDELETE(userDeleteReq, { params: Promise.resolve({ id: userId1 }) });
  assert(userDeleteRes.status === 403, 'Regular user blocked from DELETE /api/admin/users/:id with 403 Forbidden');

  console.log(`\n======================================================`);
  console.log(`TOTAL PHASE 3 TESTS: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3Tests().catch((err) => {
  console.error('Fatal error in Phase 3 test suite:', err);
  process.exit(1);
});
