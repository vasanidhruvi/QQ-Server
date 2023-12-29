const { matchedData } = require('express-validator')

const {
  findUser,
  userIsBlocked,
  checkLoginAttemptsAndBlockExpires,
  passwordsDoNotMatch,
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken
} = require('./helpers')

const { handleError } = require('../../middleware/utils')
const AuthenticationService = require('../../services/authentication/authentication.service')
const { checkPassword } = require('../../middleware/auth')

module.exports = {
  login,
  authenticate,
  register,
  forgotUserPassword
}

async function authenticate(req, res, next) {
  try {
    let result = await AuthenticationService.authenticate(req);
    res.json(result);
  } catch (e) {
    res.json(e);
  }
}

async function register(req, res, next) {
  try {
      let result = await AuthenticationService.register(req.body);
      res.json(result);
  } catch (e) {
      res.json(e);
  }
}

async function forgotUserPassword(req, res, next) {
  try {
    if(req.body) {
      let result = await AuthenticationService.forgotUserPassword(req.body.email);
      res.json(result);
    } else {
      res.json({ success: false, message: 'Email is required!'});
    }
  } catch (e) {
      res.json(e);
  }
}

async function login(req, res) {
  try {
    const data = matchedData(req)
    const user = await findUser(data.email)
    await userIsBlocked(user)
    await checkLoginAttemptsAndBlockExpires(user)
    const isPasswordMatch = await checkPassword(data.password, user)
    if (!isPasswordMatch) {
      handleError(res, await passwordsDoNotMatch(user))
    } else {
      // all ok, register access and return token
      user.loginAttempts = 0
      await saveLoginAttemptsToDB(user)
      res.status(200).json(await saveUserAccessAndReturnToken(req, user))
    }
  } catch (error) {
    handleError(res, error)
  }
}

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
// const login = async (req, res) => {
//   try {
//     const data = matchedData(req)
//     const user = await findUser(data.email)
//     await userIsBlocked(user)
//     await checkLoginAttemptsAndBlockExpires(user)
//     const isPasswordMatch = await checkPassword(data.password, user)
//     if (!isPasswordMatch) {
//       handleError(res, await passwordsDoNotMatch(user))
//     } else {
//       // all ok, register access and return token
//       user.loginAttempts = 0
//       await saveLoginAttemptsToDB(user)
//       res.status(200).json(await saveUserAccessAndReturnToken(req, user))
//     }
//   } catch (error) {
//     handleError(res, error)
//   }
// }