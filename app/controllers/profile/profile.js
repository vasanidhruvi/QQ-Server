const ProfileService = require('../../services/profile/profile.service')


module.exports = {
    getByUserId,
  }
  
  async function getByUserId(req, res, next) {
    try {
      let result = await ProfileService.getByUserId(req);
      res.json(result);
    } catch (e) {
      res.json(e);
    }
  }