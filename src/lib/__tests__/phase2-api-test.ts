import { POST as signupPOST } from '../../app/api/auth/signup/route';
import { POST as loginPOST } from '../../app/api/auth/login/route';
import { POST as logoutPOST } from '../../app/api/auth/logout/route';
import { GET as meGET } from '../../app/api/auth/me/route';
import { NextRequest } from 'next/server';
import User from '../../models/User';
import { hashPassword, createToken } from '../../lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'super_secret_jwt_for_testing_purposes_2026';
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
}

// In-memory mock database store for testing route handlers
const mockUserStore: Map<string, MockStoredUser> = new Map();

function setupMocks() {
  // Mock global.mongooseCache so connectToDatabase resolves immediately
  global.mongooseCache = { conn: {} as typeof mongoose, promise: Promise.resolve({} as typeof mongoose) };

  // Mock User.findOne
  User.findOne = (async (query: { email: string }) => {
    const email = query?.email?.toLowerCase();
    for (const u of mockUserStore.values()) {
      if (u.email.toLowerCase() === email) {
        return {
          ...u,
          comparePassword: async (candidate: string) => {
            return u._rawPassword === candidate;
          },
        };
      }
    }
    return null;
  }) as unknown as typeof User.findOne;

  // Mock User.findById
  User.findById = (async (id: string) => {
    const u = mockUserStore.get(id);
    if (!u) return null;
    return {
      ...u,
      comparePassword: async (candidate: string) => {
        return u._rawPassword === candidate;
      },
    };
  }) as unknown as typeof User.findById;

  // Mock User.create
  User.create = (async (data: { name: string; email: string; password: string; role: 'user' | 'admin' }) => {
    const id = 'mock_id_' + Math.random().toString(36).substring(7);
    const hashedPassword = await hashPassword(data.password);
    const createdUser: MockStoredUser = {
      _id: id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      _rawPassword: data.password, // For test verification
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserStore.set(id, createdUser);
    return createdUser;
  }) as unknown as typeof User.create;
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

async function runPhase2Tests() {
  setupMocks();
  console.log('\n======================================================');
  console.log('   PHASE 2 AUTHENTICATION API TEST SUITE');
  console.log('======================================================\n');

  console.log('--- 1. SIGNUP API (POST /api/auth/signup) ---');

  // Test 1.1: Valid signup
  const validSignupReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'Monkey D. Luffy',
    email: 'luffy@strawhat.com',
    password: 'gear5liberation',
  });
  const signupRes = await signupPOST(validSignupReq);
  const signupData = await signupRes.json();
  const signupCookie = signupRes.headers.get('set-cookie') || '';

  assert(signupRes.status === 201, 'Signup returns HTTP 201 Created');
  assert(signupData.success === true, 'Signup returns success: true');
  assert(signupData.user?.name === 'Monkey D. Luffy', 'Signup returns correct user name');
  assert(signupData.user?.email === 'luffy@strawhat.com', 'Signup returns correct user email');
  assert(signupData.user?.role === 'user', 'Signup assigns role = "user"');
  assert(signupData.user?.password === undefined, 'Signup never returns password');
  assert(signupData.token === undefined && signupData.jwt === undefined, 'Signup does not expose JWT in JSON body');
  assert(signupCookie.includes('auth_token='), 'Signup sets auth_token cookie');
  assert(signupCookie.includes('HttpOnly'), 'Signup sets HttpOnly flag on cookie');

  // Test 1.2: Missing name
  const missingNameReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    email: 'zoro@strawhat.com',
    password: 'santoryu_slash',
  });
  const missingNameRes = await signupPOST(missingNameReq);
  assert(missingNameRes.status === 400, 'Signup rejects missing name with 400 Bad Request');

  // Test 1.3: Empty name
  const emptyNameReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: '   ',
    email: 'zoro@strawhat.com',
    password: 'santoryu_slash',
  });
  const emptyNameRes = await signupPOST(emptyNameReq);
  assert(emptyNameRes.status === 400, 'Signup rejects whitespace-only name with 400 Bad Request');

  // Test 1.4: Invalid email format
  const invalidEmailReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'Roronoa Zoro',
    email: 'not-an-email',
    password: 'santoryu_slash',
  });
  const invalidEmailRes = await signupPOST(invalidEmailReq);
  assert(invalidEmailRes.status === 400, 'Signup rejects invalid email format with 400 Bad Request');

  // Test 1.5: Short password (< 6 chars)
  const shortPassReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'Roronoa Zoro',
    email: 'zoro@strawhat.com',
    password: '123',
  });
  const shortPassRes = await signupPOST(shortPassReq);
  assert(shortPassRes.status === 400, 'Signup rejects password shorter than 6 characters');

  // Test 1.6: Duplicate email
  const dupEmailReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'Duplicate Luffy',
    email: 'luffy@strawhat.com',
    password: 'anotherpassword',
  });
  const dupEmailRes = await signupPOST(dupEmailReq);
  assert(dupEmailRes.status === 400, 'Signup rejects duplicate email with 400 Bad Request');

  // Test 1.7: Attempt to send role="admin"
  const adminAttemptReq = createJsonRequest('http://localhost:3000/api/auth/signup', 'POST', {
    name: 'Imu Sama',
    email: 'imu@worldgov.org',
    password: 'empty_throne_999',
    role: 'admin', // Malicious privilege escalation attempt
  });
  const adminAttemptRes = await signupPOST(adminAttemptReq);
  const adminAttemptData = await adminAttemptRes.json();
  assert(adminAttemptRes.status === 201, 'Signup processes request while sanitizing role');
  assert(adminAttemptData.user?.role === 'user', 'Signup strictly enforces role = "user" despite role="admin" in payload');

  console.log('\n--- 2. LOGIN API (POST /api/auth/login) ---');

  // Test 2.1: Correct email/password
  const validLoginReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'luffy@strawhat.com',
    password: 'gear5liberation',
  });
  const loginRes = await loginPOST(validLoginReq);
  const loginData = await loginRes.json();
  const loginCookie = loginRes.headers.get('set-cookie') || '';

  assert(loginRes.status === 200, 'Login returns HTTP 200 OK');
  assert(loginData.success === true, 'Login returns success: true');
  assert(loginData.user?.email === 'luffy@strawhat.com', 'Login returns safe user object');
  assert(loginData.user?.password === undefined, 'Login never returns password');
  assert(loginData.token === undefined && loginData.jwt === undefined, 'Login does not expose JWT in JSON body');
  assert(loginCookie.includes('auth_token='), 'Login sets auth_token cookie');
  assert(loginCookie.includes('HttpOnly'), 'Login cookie is HttpOnly');

  // Test 2.2: Wrong password
  const wrongPassReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'luffy@strawhat.com',
    password: 'WrongPassword!',
  });
  const wrongPassRes = await loginPOST(wrongPassReq);
  const wrongPassData = await wrongPassRes.json();
  assert(wrongPassRes.status === 401, 'Login rejects wrong password with 401 Unauthorized');
  assert(wrongPassData.error === 'Invalid email or password', 'Login returns generic error message');

  // Test 2.3: Non-existing email
  const nonExistReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'nonexistent@nowhere.com',
    password: 'somepassword123',
  });
  const nonExistRes = await loginPOST(nonExistReq);
  const nonExistData = await nonExistRes.json();
  assert(nonExistRes.status === 401, 'Login rejects non-existing email with 401 Unauthorized');
  assert(nonExistData.error === 'Invalid email or password', 'Login returns identical generic error for non-existing user (prevents enumeration)');

  // Test 2.4: Missing fields
  const missingPassReq = createJsonRequest('http://localhost:3000/api/auth/login', 'POST', {
    email: 'luffy@strawhat.com',
  });
  const missingPassRes = await loginPOST(missingPassReq);
  assert(missingPassRes.status === 400, 'Login rejects missing password with 400 Bad Request');

  console.log('\n--- 3. CURRENT USER API (GET /api/auth/me) ---');

  // Extract auth token from login cookie
  const tokenMatch = loginCookie.match(/auth_token=([^;]+)/);
  const authToken = tokenMatch ? tokenMatch[1] : '';

  // Test 3.1: Logged-in user with valid cookie
  const validMeReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET', undefined, `auth_token=${authToken}`);
  const meRes = await meGET(validMeReq);
  const meData = await meRes.json();

  assert(meRes.status === 200, 'Me returns HTTP 200 OK for logged-in user');
  assert(meData.success === true, 'Me returns success: true');
  assert(meData.user?.email === 'luffy@strawhat.com', 'Me returns accurate user profile');
  assert(meData.user?.password === undefined, 'Me never returns password');

  // Test 3.2: No cookie
  const noCookieReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET');
  const noCookieRes = await meGET(noCookieReq);
  assert(noCookieRes.status === 401, 'Me rejects request without cookie with 401 Unauthorized');

  // Test 3.3: Invalid token
  const invalidTokenReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET', undefined, 'auth_token=garbage_token_value');
  const invalidTokenRes = await meGET(invalidTokenReq);
  assert(invalidTokenRes.status === 401, 'Me rejects malformed token with 401 Unauthorized');

  // Test 3.4: Expired token
  const expiredToken = jwt.sign(
    { userId: signupData.user.id, email: 'luffy@strawhat.com', role: 'user', name: 'Luffy' },
    process.env.JWT_SECRET!,
    { expiresIn: '0s' }
  );
  // Wait 15ms to ensure expiration
  await new Promise((r) => setTimeout(r, 15));
  const expiredTokenReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET', undefined, `auth_token=${expiredToken}`);
  const expiredTokenRes = await meGET(expiredTokenReq);
  assert(expiredTokenRes.status === 401, 'Me rejects expired token with 401 Unauthorized');

  // Test 3.5: Deleted/non-existing user with valid token
  const ghostToken = createToken({
    userId: 'mock_id_deleted_user_999',
    email: 'deleted@user.com',
    role: 'user',
    name: 'Ghost',
  });
  const ghostReq = createJsonRequest('http://localhost:3000/api/auth/me', 'GET', undefined, `auth_token=${ghostToken}`);
  const ghostRes = await meGET(ghostReq);
  assert(ghostRes.status === 404, 'Me returns 404 Not Found when user no longer exists in DB');

  console.log('\n--- 4. LOGOUT API (POST /api/auth/logout) ---');

  // Test 4.1: Logged-in user logout
  const logoutRes = await logoutPOST();
  const logoutData = await logoutRes.json();
  const logoutCookie = logoutRes.headers.get('set-cookie') || '';

  assert(logoutRes.status === 200, 'Logout returns HTTP 200 OK');
  assert(logoutData.success === true, 'Logout returns success: true');
  assert(logoutData.message === 'Logged out successfully', 'Logout returns success message');
  assert(logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires='), 'Logout invalidates cookie with Max-Age=0');

  // Test 4.2: Already logged-out user
  const unauthLogoutRes = await logoutPOST();
  assert(unauthLogoutRes.status === 200, 'Logout works cleanly even when already logged out');

  console.log('\n--- 5. PASSWORD & STORAGE SECURITY AUDIT ---');

  // Verify stored user in mock DB has hashed password and never plaintext
  const storedUser = Array.from(mockUserStore.values()).find((u: MockStoredUser) => u.email === 'luffy@strawhat.com');
  assert(storedUser !== undefined, 'User found in database');
  assert(storedUser?.password.startsWith('$2') === true, 'User password stored in DB is a bcrypt hash');
  assert(storedUser?.password !== 'gear5liberation', 'Plaintext password is NEVER stored');

  console.log(`\n======================================================`);
  console.log(`TOTAL PHASE 2 TESTS: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Fatal error in Phase 2 test suite:', err);
  process.exit(1);
});
