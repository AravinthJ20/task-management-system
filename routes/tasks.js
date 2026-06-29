const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendEmail } = require('../helpers/mailer');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const tasks = await Task.find().populate('project assignedTo').sort({ createdAt: -1 }).lean();
  res.render('tasks/index', { title: 'Tasks', tasks });
});

router.get('/new', async (req, res) => {
  const projects = await Project.find().sort({ name: 1 }).lean();
  const users = await User.find().sort({ name: 1 }).lean();
  res.render('tasks/new', { title: 'New Task', projects, users });
});

router.post('/', async (req, res) => {
  const { title, description, project, assignedTo, dueDate, status } = req.body;
  const task = await Task.create({ title, description, project, assignedTo: assignedTo || null, dueDate, status });

  if (assignedTo) {
    const user = await User.findById(assignedTo);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `Task assigned: ${task.title}`,
        html: `<p>Hi ${user.name},</p><p>You have been assigned a new task: <strong>${task.title}</strong>.</p><p>Status: ${task.status}</p><p>Description: ${task.description || 'No description'}</p>`,
      });
    }
  }

  res.redirect('/tasks');
});

router.get('/:id/edit', async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  const projects = await Project.find().sort({ name: 1 }).lean();
  const users = await User.find().sort({ name: 1 }).lean();
  res.render('tasks/edit', { title: 'Edit Task', task, projects, users });
});

router.put('/:id', async (req, res) => {
  const { title, description, project, assignedTo, dueDate, status } = req.body;
  const task = await Task.findById(req.params.id);
  const previousAssignedTo = task.assignedTo?.toString();

  task.title = title;
  task.description = description;
  task.project = project;
  task.assignedTo = assignedTo || null;
  task.dueDate = dueDate;
  task.status = status;
  await task.save();

  if (assignedTo && assignedTo !== previousAssignedTo) {
    const user = await User.findById(assignedTo);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: `Task assigned: ${task.title}`,
        html: `<p>Hi ${user.name},</p><p>You have been assigned a task: <strong>${task.title}</strong>.</p><p>Status: ${task.status}</p>`,
      });
    }
  }

  res.redirect('/tasks');
});

router.delete('/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/tasks');
});

module.exports = router;
