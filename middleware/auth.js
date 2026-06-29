const User = require('../models/User');
const {
  buildExpiredSessionCookie,
  hashSessionToken,
  readSessionCookie,
} = require('../helpers/auth');

async function loadCurrentUser(req, res, next) {
  res.locals.currentUser = null;
  res.locals.isAuthenticated = false;

  const session = readSessionCookie(req.headers.cookie);
  if (!session) {
    return next();
  }

  try {
    const user = await User.findById(session.userId);
    if (!user || !user.sessionTokenHash) {
      res.setHeader('Set-Cookie', buildExpiredSessionCookie());
      return next();
    }

    if (user.sessionTokenHash !== hashSessionToken(session.token)) {
      res.setHeader('Set-Cookie', buildExpiredSessionCookie());
      return next();
    }

    req.currentUser = user;
    res.locals.currentUser = user.toObject();
    res.locals.isAuthenticated = true;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    const redirectTo = encodeURIComponent(req.originalUrl || '/');
    return res.redirect(`/auth/login?next=${redirectTo}`);
  }

  return next();
}

function requireGuest(req, res, next) {
  if (req.currentUser) {
    return res.redirect('/');
  }

  return next();
}

module.exports = {
  loadCurrentUser,
  requireAuth,
  requireGuest,
};
