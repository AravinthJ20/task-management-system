# Task Management App

A Node.js + Express + MongoDB project management app using Express Handlebars.

## Features
- Create and manage projects
- Create tasks and assign them to users
- Task status tracking
- Email notifications for assignments and task creation

## Setup
1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Start MongoDB locally or provide a MongoDB URI
4. Run the app:
   - `npm run dev`
   - `npm start`

## Environment variables
- `PORT`
- `MONGODB_URI`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

## App routes
- `/` - dashboard
- `/projects` - projects list
- `/projects/new` - create project
- `/projects/:id` - project details
- `/tasks` - tasks overview
- `/users` - users list
