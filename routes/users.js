const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.render('users/index', { title: 'Users', users });
});

router.get('/new', (req, res) => {
  res.render('users/new', { title: 'New User' });
});

router.post('/', async (req, res) => {
  const { name, email, role } = req.body;
  await User.create({ name, email, role });
  res.redirect('/users');
});

module.exports = router;
