import {
  hashPassword,
  comparePassword,
  createToken,
  verifyToken,
  requireAuth,
  requireAdmin,
  extractTokenFromRequest,
  setAuthCookie,
  clearAuthCookie,
} from '../auth';
import {
  validateRegisterInput,
  validateLoginInput,
} from '../validations/auth';
import { NextResponse } from 'next/server';

process.env.JWT_SECRET = 'test_secret_for_verification_only_1234567890';
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

async function runTests() {
  console.log('\n--- 1. Password Hashing & Security Tests ---');
  const password = 'StrawHatPirate2026!';
  const hashedPassword = await hashPassword(password);
  
  assert(hashedPassword !== password, 'Password is never stored in plain text');
  assert(hashedPassword.startsWith('$2'), 'Password uses bcrypt hash format');
  
  const isMatch = await comparePassword(password, hashedPassword);
  assert(isMatch === true, 'comparePassword correctly matches plain password with hash');
  
  const isWrongMatch = await comparePassword('WrongPassword123', hashedPassword);
  assert(isWrongMatch === false, 'comparePassword correctly rejects wrong password');

  console.log('\n--- 2. JWT Signing & Verification Tests ---');
  const userPayload = {
    userId: 'user_123456',
    email: 'luffy@thousand-sunny.go',
    role: 'user' as const,
    name: 'Monkey D. Luffy',
  };
  
  const token = createToken(userPayload, '1h');
  assert(typeof token === 'string' && token.split('.').length === 3, 'createToken produces valid 3-segment JWT');
  
  const verified = verifyToken(token);
  assert(verified !== null, 'verifyToken successfully decodes valid token');
  assert(verified?.userId === 'user_123456', 'Decoded token contains correct userId');
  assert(verified?.role === 'user', 'Decoded token contains correct role');
  assert(verified?.email === 'luffy@thousand-sunny.go', 'Decoded token contains correct email');

  const invalidVerified = verifyToken('invalid.jwt.token');
  assert(invalidVerified === null, 'verifyToken returns null on malformed token');

  console.log('\n--- 3. Validation & Role Tampering Prevention Tests ---');
  // Normal valid input
  const validReg = validateRegisterInput({
    name: '  Roronoa Zoro  ',
    email: '  ZORO@WANO.ORG  ',
    password: 'enma_sword_secret',
    role: 'admin', // Tampering attempt!
  });
  
  assert(validReg.isValid === true, 'validateRegisterInput passes valid input');
  assert(validReg.data?.name === 'Roronoa Zoro', 'validateRegisterInput trims name');
  assert(validReg.data?.email === 'zoro@wano.org', 'validateRegisterInput normalizes email to lowercase & trimmed');
  assert(!('role' in (validReg.data || {})), 'validateRegisterInput strips role parameter to prevent admin privilege escalation');

  // Invalid inputs
  const invalidEmail = validateRegisterInput({
    name: 'Nami',
    email: 'invalid-email-format',
    password: 'berries_1000000',
  });
  assert(invalidEmail.isValid === false && !!invalidEmail.errors.email, 'validateRegisterInput catches invalid email format');

  const shortPassword = validateRegisterInput({
    name: 'Sanji',
    email: 'sanji@baratie.com',
    password: '123',
  });
  assert(shortPassword.isValid === false && !!shortPassword.errors.password, 'validateRegisterInput enforces minimum password length');

  const emptyName = validateRegisterInput({
    name: '  ',
    email: 'usopp@syrup.com',
    password: 'sniper_king_99',
  });
  assert(emptyName.isValid === false && !!emptyName.errors.name, 'validateRegisterInput rejects empty/blank name');

  // Login input validation
  const validLogin = validateLoginInput({
    email: '  ZORO@WANO.ORG  ',
    password: 'enma_sword_secret',
  });
  assert(validLogin.isValid === true && validLogin.data?.email === 'zoro@wano.org', 'validateLoginInput validates and normalizes email');

  const invalidLogin = validateLoginInput({
    email: 'invalid',
    password: '',
  });
  assert(invalidLogin.isValid === false && !!invalidLogin.errors.password, 'validateLoginInput rejects missing password');

  console.log('\n--- 4. Authentication & Role-Based API Guards ---');
  // Unauthenticated request
  const unauthReq = new Request('http://localhost:3000/api/protected');
  const unauthGuard = await requireAuth(unauthReq);
  assert(!!unauthGuard.error, 'requireAuth rejects unauthenticated requests with error');

  // Extract token helper test
  const extracted = extractTokenFromRequest(
    new Request('http://localhost:3000', {
      headers: { cookie: `auth_token=${token}` },
    })
  );
  assert(extracted === token, 'extractTokenFromRequest extracts auth_token from cookie');

  // Authenticated user request
  const userReq = new Request('http://localhost:3000/api/protected', {
    headers: {
      cookie: `auth_token=${token}`,
    },
  });
  const userGuard = await requireAuth(userReq);
  assert(!userGuard.error && userGuard.user?.userId === 'user_123456', 'requireAuth accepts request with valid auth_token cookie');

  // Bearer Authorization Header
  const bearerReq = new Request('http://localhost:3000/api/protected', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const bearerGuard = await requireAuth(bearerReq);
  assert(!bearerGuard.error && bearerGuard.user?.userId === 'user_123456', 'requireAuth accepts request with Bearer Authorization header');

  // Admin guard with user role (should 403 Forbidden)
  const adminGuardUser = await requireAdmin(userReq);
  assert(!!adminGuardUser.error, 'requireAdmin rejects normal user role with error response');

  // Admin guard with admin role (should pass)
  const adminToken = createToken({
    userId: 'admin_999',
    email: 'fleet_admiral@navy.gov',
    role: 'admin',
    name: 'Sengoku',
  });
  const adminReq = new Request('http://localhost:3000/api/admin', {
    headers: {
      cookie: `auth_token=${adminToken}`,
    },
  });
  const adminGuardPass = await requireAdmin(adminReq);
  assert(!adminGuardPass.error && adminGuardPass.user?.role === 'admin', 'requireAdmin permits user with admin role');

  console.log('\n--- 5. Cookie Management Helpers ---');
  const res = NextResponse.json({ success: true });
  setAuthCookie(res, token);
  const cookieHeader = res.headers.get('set-cookie');
  assert(!!cookieHeader && cookieHeader.includes('auth_token='), 'setAuthCookie sets auth_token in set-cookie header');
  assert(!!cookieHeader && cookieHeader.includes('HttpOnly'), 'setAuthCookie sets HttpOnly flag');

  const logoutRes = NextResponse.json({ success: true });
  clearAuthCookie(logoutRes);
  const clearCookieHeader = logoutRes.headers.get('set-cookie');
  assert(!!clearCookieHeader && (clearCookieHeader.includes('Max-Age=0') || clearCookieHeader.includes('Expires=')), 'clearAuthCookie expires the auth_token cookie');

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
