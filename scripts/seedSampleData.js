const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { hashPassword } = require('../helpers/auth');

dotenv.config();

async function seed() {
  await connectDB();

  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});

  const users = await User.insertMany([
    {
      name: 'Ava Thompson',
      email: 'ava.thompson@example.com',
      role: 'Admin',
      passwordHash: hashPassword('Password123'),
    },
    {
      name: 'Rohan Patel',
      email: 'rohan.patel@example.com',
      role: 'Project Manager',
      passwordHash: hashPassword('Password123'),
    },
    {
      name: 'Mia Chen',
      email: 'mia.chen@example.com',
      role: 'Developer',
      passwordHash: hashPassword('Password123'),
    },
    {
      name: 'Noah Garcia',
      email: 'noah.garcia@example.com',
      role: 'Developer',
      passwordHash: hashPassword('Password123'),
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair@example.com',
      role: 'QA Engineer',
      passwordHash: hashPassword('Password123'),
    },
  ]);

  const projects = await Project.insertMany([
    {
      name: 'Website Redesign',
      description: 'Refresh the company website with improved navigation, branding, and mobile responsiveness.',
    },
    {
      name: 'Mobile App Launch',
      description: 'Prepare the first public release of the mobile task management app.',
    },
    {
      name: 'Internal Analytics Dashboard',
      description: 'Build a dashboard for tracking team productivity and delivery health.',
    },
  ]);

  const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));
  const projectByName = Object.fromEntries(projects.map((project) => [project.name, project]));

  await Task.insertMany([
    {
      title: 'Finalize homepage wireframes',
      description: 'Review stakeholder feedback and lock the homepage layout for development.',
      status: 'Completed',
      project: projectByName['Website Redesign']._id,
      assignedTo: userByEmail['rohan.patel@example.com']._id,
      dueDate: new Date('2026-07-02'),
    },
    {
      title: 'Implement responsive navbar',
      description: 'Build the new navigation bar and verify tablet/mobile breakpoints.',
      status: 'In Progress',
      project: projectByName['Website Redesign']._id,
      assignedTo: userByEmail['mia.chen@example.com']._id,
      dueDate: new Date('2026-07-06'),
    },
    {
      title: 'Prepare regression test checklist',
      description: 'Create a QA checklist for redesigned pages before launch.',
      status: 'Todo',
      project: projectByName['Website Redesign']._id,
      assignedTo: userByEmail['priya.nair@example.com']._id,
      dueDate: new Date('2026-07-08'),
    },
    {
      title: 'Set up push notification service',
      description: 'Configure notifications for task assignments and due date reminders.',
      status: 'In Progress',
      project: projectByName['Mobile App Launch']._id,
      assignedTo: userByEmail['noah.garcia@example.com']._id,
      dueDate: new Date('2026-07-10'),
    },
    {
      title: 'App store screenshots',
      description: 'Capture polished screenshots for the Android and iOS listing pages.',
      status: 'Blocked',
      project: projectByName['Mobile App Launch']._id,
      assignedTo: userByEmail['ava.thompson@example.com']._id,
      dueDate: new Date('2026-07-12'),
    },
    {
      title: 'Create KPI summary cards',
      description: 'Add top-level metrics for completed tasks, blockers, and team velocity.',
      status: 'Todo',
      project: projectByName['Internal Analytics Dashboard']._id,
      assignedTo: userByEmail['mia.chen@example.com']._id,
      dueDate: new Date('2026-07-15'),
    },
    {
      title: 'Connect dashboard to reporting API',
      description: 'Fetch weekly delivery metrics and display them in the admin dashboard.',
      status: 'Todo',
      project: projectByName['Internal Analytics Dashboard']._id,
      assignedTo: userByEmail['noah.garcia@example.com']._id,
      dueDate: new Date('2026-07-18'),
    },
    {
      title: 'Validate dashboard numbers',
      description: 'Compare dashboard totals with exported reports to confirm accuracy.',
      status: 'Todo',
      project: projectByName['Internal Analytics Dashboard']._id,
      assignedTo: userByEmail['priya.nair@example.com']._id,
      dueDate: new Date('2026-07-20'),
    },
  ]);

  console.log('Sample data inserted successfully.');
  console.log('Login with ava.thompson@example.com / Password123');
}

seed()
  .catch((error) => {
    console.error('Sample data seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
