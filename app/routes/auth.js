const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const AuthenticationController = require('../controllers/auth/login');
const {
  register,
  verify,
  forgotPassword,
  resetPassword,
  getRefreshToken,
  roleAuthorization
} = require('../controllers/auth')

const {
  validateRegister,
  validateVerify,
  validateForgotPassword,
  validateResetPassword,
  validateLogin
} = require('../controllers/auth/validators')

/*
 * Auth routes
 */

/*
 * Register route
 */
// router.post('/register', trimRequest.all, validateRegister, register)

/*
 * Verify route
 */
router.post('/verify', trimRequest.all, validateVerify, verify)

/*
 * Forgot password route
 */
router.post('/forgot', trimRequest.all, validateForgotPassword, forgotPassword)

/*
 * Reset password route
 */
router.post('/reset', trimRequest.all, validateResetPassword, resetPassword)

/*
 * Get new refresh token
 */
router.get(
  '/token',
  requireAuth,
  roleAuthorization(['user', 'admin']),
  trimRequest.all,
  getRefreshToken
)

/*
 * Login route
 */
// router.post('/login', login)

// module.exports = router
module.exports = function (router) { 
  router.post('/login', AuthenticationController.authenticate);
  router.post('/register', AuthenticationController.register);
  router.post('/reset-password', AuthenticationController.forgotUserPassword);
}