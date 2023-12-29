const { buildErrObject } = require('./buildErrObject')
const { buildSuccObject } = require('./buildSuccObject')
const { getBrowserInfo } = require('./getBrowserInfo')
const { getCountry } = require('./getCountry')
const { getIP } = require('./getIP')
const { handleError } = require('./handleError')
const { isIDGood } = require('./isIDGood')
const { itemNotFound } = require('./itemNotFound')
const { removeExtensionFromFile } = require('./removeExtensionFromFile')
const { validateResult } = require('./validateResult')
const CounterSchema = require('../../models/counter.model');

module.exports = {
  buildErrObject,
  buildSuccObject,
  getBrowserInfo,
  getCountry,
  getIP,
  handleError,
  isIDGood,
  itemNotFound,
  removeExtensionFromFile,
  validateResult,
  generateCounterId,
    createAuthToken,
    getUserIdFromRequest
}

async function generateCounterId(model, field, prefix, extraPreFix) {
  let promiseFunction = async (resolve, reject) => {
      let counterObj = null;
      try {
          counterObj = await CounterSchema.findOneAndUpdate(
              { model: model, field: field, prefix: prefix },
              { $inc: { seq: 1 } },
              { new: true, upsert: true }).exec();
      } catch (e) {
          reject(e);
          return;
      }
      if (counterObj && counterObj._id) {
          if (extraPreFix) {
              resolve(extraPreFix + '_' + counterObj.prefix + counterObj.seq);
          } else {
              resolve(counterObj.prefix + counterObj.seq);
          }
      } else {
          reject(counterObj);
      }
  }
  let promise = new Promise(promiseFunction);
  return promise;
}

function createAuthToken(user) {
  let random = crypto.randomBytes(10).toString('hex');
  let userRandom = {};
  userRandom.id = user.userId;
  userRandom.random = random;
  userRandom.jti = process.env.jti;
  let accessToken = jwt.sign(userRandom, appConfig.jwtSecret, {
      expiresIn: appConfig.tokenExpirationTime
      // expiresIn: 60 * 1 // Expires in a minute
  });
  user['accessToken'] = accessToken;
  let refreshToken = crypto.randomBytes(40).toString('hex');
  user['refreshToken'] = refreshToken;
  return user;
}

function getUserIdFromRequest(req) {
    let userid = null;
    if (req && req.headers) {
        userid = req.headers.userid;
    }
    return userid;
}