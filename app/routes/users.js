const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const UserController = require('../controllers/users/user.controller')
const AuthenticationController = require('../controllers/auth/login')
const { roleAuthorization } = require('../controllers/auth')
const helper = require('../utility');

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/users')

const {
  validateCreateUser,
  validateGetUser,
  validateUpdateUser,
  validateDeleteUser
} = require('../controllers/users/validators')

/*
 * Users routes
 */

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  getUsers
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateCreateUser,
  createUser
)

/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateGetUser,
  getUser
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateUpdateUser,
  updateUser
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validateDeleteUser,
  deleteUser
)

// module.exports = router
module.exports = function (router) { 
  router.post('/user/getAll', helper.util.authenticationMiddleware, UserController.getUsers);
  router.post('/user/getByUserId', helper.util.authenticationMiddleware, UserController.getByUserId);
  router.post('/user/add', helper.util.authenticationMiddleware, AuthenticationController.register);
  router.post('/user/update', helper.util.authenticationMiddleware, UserController.update);
  router.post('/user/deleteById', helper.util.authenticationMiddleware, UserController.deleteById);
  router.post('/user/changePassword', helper.util.authenticationMiddleware, UserController.changePassword);
}