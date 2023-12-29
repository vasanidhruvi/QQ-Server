const PermissionService = require('../services/permissions.service');
const helper = require('../middleware/utils');

module.exports = {
    getBy,
    update
}

async function getBy(req, res, next) {
    try {
        let result = await PermissionService.getBy(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function update(req, res, next) {
    try {
        let result = await PermissionService.update(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}