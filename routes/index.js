const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    const allTasks = await Task.find()
      .populate('project assignedTo')
      .sort({ createdAt: -1 })
      .lean();
    const tasks = allTasks.slice(0, 6);
    const completedTasks = allTasks.filter((task) => task.status === 'Completed').length;
    const inProgressTasks = allTasks.filter((task) => task.status === 'In Progress').length;
    const blockedTasks = allTasks.filter((task) => task.status === 'Blocked').length;
    const unassignedTasks = allTasks.filter((task) => !task.assignedTo).length;
    const dueSoonTasks = allTasks
      .filter((task) => task.dueDate && task.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);

    const stats = {
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      unassignedTasks,
      completionRate: allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0,
    };

    res.render('home', {
      title: 'Dashboard',
      projects,
      tasks,
      dueSoonTasks,
      spotlightProject: projects[0] || null,
      stats,
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
