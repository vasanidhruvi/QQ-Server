/**
 * This file configures routing mechanism
 */

// Inject node module dependencies
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const rolesRoutes = require('./roles');
const userRoutes = require('./users');
const techRoutes = require('./tech');
const parentRoutes = require('./parent');
const questionRoutes = require('./question');
const homeClientRoutes = require('./home-clients');
const express = require('express');

module.exports = function (app) {
  // get an instance of the router for api routes
  const apiRoutes = express.Router();
  const clientRoutes = express.Router();

  authRoutes(apiRoutes);
  profileRoutes(apiRoutes);
  rolesRoutes(apiRoutes);
  userRoutes(apiRoutes);
  techRoutes(apiRoutes);
  parentRoutes(apiRoutes);
  questionRoutes(apiRoutes);

  homeClientRoutes(clientRoutes)
  
  // Add prefix to routes
  app.use('/admin-panel/', apiRoutes); // Assign name to end points (e.g., '/api/management/', '/api/users' ,etc. )
  app.use('/client-panel/', clientRoutes); // Assign name to end points (e.g., '/api/management/', '/api/users' ,etc. )
};
