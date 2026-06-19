const express = require('express');
const User = require('../models/User');
const {
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSessionCookieValue,
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} = require('../helpers/auth');
const { requireGuest } = require('../middleware/auth');

const router = express.Router();

function getSafeRedirect(nextUrl) {
  if (!nextUrl || typeof nextUrl !== 'string' || !nextUrl.startsWith('/')) {
    return '/';
  }

  if (nextUrl.startsWith('//')) {
    return '/';
  }

  return nextUrl;
}

router.get('/register', requireGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    next: getSafeRedirect(req.query.next),
    form: {
      name: '',
      email: '',
      role: 'User',
    },
  });
});

router.post('/register', requireGuest, async (req, res) => {
  const { name = '', email = '', role = 'User', password = '', confirmPassword = '', next: nextUrl = '/' } = req.body;
  const form = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role.trim() || 'User',
  };
  const safeRedirect = getSafeRedirect(nextUrl);

  if (!form.name || !form.email || !password) {
    return res.status(400).render('auth/register', {
      title: 'Register',
      error: 'Name, email, and password are required.',
      next: safeRedirect,
      form,
    });
  }

  if (password.length < 8) {
    return res.status(400).render('auth/register', {
      title: 'Register',
      error: 'Password must be at least 8 characters long.',
      next: safeRedirect,
      form,
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).render('auth/register', {
      title: 'Register',
      error: 'Password confirmation does not match.',
      next: safeRedirect,
      form,
    });
  }

  const sessionToken = generateSessionToken();
  let user = await User.findOne({ email: form.email });

  if (user && user.passwordHash) {
    return res.status(400).render('auth/register', {
      title: 'Register',
      error: 'An account with that email already exists.',
      next: safeRedirect,
      form,
    });
  }

  if (user) {
    user.name = form.name;
    user.role = form.role;
    user.passwordHash = hashPassword(password);
    user.sessionTokenHash = hashSessionToken(sessionToken);
    await user.save();
  } else {
    user = await User.create({
      ...form,
      passwordHash: hashPassword(password),
      sessionTokenHash: hashSessionToken(sessionToken),
    });
  }

  res.setHeader('Set-Cookie', buildSessionCookie(createSessionCookieValue(user.id, sessionToken)));
  return res.redirect(safeRedirect);
});

router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    next: getSafeRedirect(req.query.next),
    form: {
      email: '',
    },
  });
});

router.post('/login', requireGuest, async (req, res) => {
  const { email = '', password = '', next: nextUrl = '/' } = req.body;
  const form = {
    email: email.trim().toLowerCase(),
  };
  const safeRedirect = getSafeRedirect(nextUrl);

  const user = await User.findOne({ email: form.email });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).render('auth/login', {
      title: 'Login',
      error: 'Invalid email or password.',
      next: safeRedirect,
      form,
    });
  }

  const sessionToken = generateSessionToken();
  user.sessionTokenHash = hashSessionToken(sessionToken);
  await user.save();

  res.setHeader('Set-Cookie', buildSessionCookie(createSessionCookieValue(user.id, sessionToken)));
  return res.redirect(safeRedirect);
});

router.post('/logout', async (req, res) => {
  if (req.currentUser) {
    req.currentUser.sessionTokenHash = null;
    await req.currentUser.save();
  }

  res.setHeader('Set-Cookie', buildExpiredSessionCookie());
  return res.redirect('/auth/login');
});

module.exports = router;
