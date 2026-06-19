const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.render('projects/index', { title: 'Projects', projects });
});

router.get('/new', (req, res) => {
  res.render('projects/new', { title: 'New Project' });
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  await Project.create({ name, description });
  res.redirect('/projects');
});

router.get('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id);
  const tasks = await Task.find({ project: req.params.id }).populate('assignedTo');
  res.render('projects/show', { title: project?.name || 'Project', project, tasks });
});

module.exports = router;
