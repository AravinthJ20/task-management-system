const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.render('users/index', { title: 'Users', users });
});

router.get('/new', (req, res) => {
  res.redirect('/auth/register');
});

router.post('/', async (req, res) => {
  res.redirect('/auth/register');
});

module.exports = router;
