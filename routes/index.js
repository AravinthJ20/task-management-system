const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    const tasks = await Task.find()
      .populate('project assignedTo')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.render('home', { title: 'Dashboard', projects, tasks });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
