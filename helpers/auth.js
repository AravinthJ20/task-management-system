const crypto = require('crypto');

const SESSION_COOKIE_NAME = 'task_manager_session';

function getAuthSecret() {
  return process.env.AUTH_SECRET || 'task-manager-dev-secret';
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(derivedKey, 'hex'));
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createSessionCookieValue(userId, token) {
  const payload = `${userId}.${token}`;
  const signature = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex);
      const value = decodeURIComponent(part.slice(separatorIndex + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function readSessionCookie(cookieHeader) {
  const cookies = parseCookies(cookieHeader);
  const rawValue = cookies[SESSION_COOKIE_NAME];

  if (!rawValue) {
    return null;
  }

  const parts = rawValue.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [userId, token, signature] = parts;
  const payload = `${userId}.${token}`;
  const expectedSignature = crypto.createHmac('sha256', getAuthSecret()).update(payload).digest('hex');

  if (signature !== expectedSignature) {
    return null;
  }

  return { userId, token };
}

function buildSessionCookie(value, maxAgeMs = 1000 * 60 * 60 * 24 * 7) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function buildExpiredSessionCookie() {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  SESSION_COOKIE_NAME,
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSessionCookieValue,
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  readSessionCookie,
  verifyPassword,
};
