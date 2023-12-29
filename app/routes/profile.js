const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const ProfileController = require('../controllers/profile/profile')
const PermissionsController = require('../controllers/permissions.controller')
const helper = require('../utility');
const { roleAuthorization } = require('../controllers/auth')

const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/profile')

const {
  validateUpdateProfile,
  validateChangePassword
} = require('../controllers/profile/validators')

/*
 * Profile routes
 */

/*
 * Get profile route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getProfile
)

/*
 * Update profile route
 */
router.patch(
  '/',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateUpdateProfile,
  updateProfile
)

/*
 * Change password route
 */
router.post(
  '/changePassword',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validateChangePassword,
  changePassword
)

// module.exports = router

module.exports = function (router) { 
  router.post('/profile/getByUserId', helper.util.authenticationMiddleware, ProfileController.getByUserId);
  router.post('/permission/getBy', helper.util.authenticationMiddleware, PermissionsController.getBy);
  router.post('/permission/update', helper.util.authenticationMiddleware, PermissionsController.update);
}