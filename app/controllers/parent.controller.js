const ParentService = require('../services/parent.service');
const helper = require('../middleware/utils');

module.exports = { 
    getAllParent,
    addParent,
    updateParent,
    deleteByParentId,
    getDistinctParent,
}

async function getAllParent(req,res, next){
    try {
        let result = await ParentService.getAllParent(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function addParent(req, res, next) {
    try {
        let criteria = req.body;
        criteria['userId'] = helper.getUserIdFromRequest(req);
        let result = await ParentService.addParent(criteria);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function updateParent(req, res, next) {
    try {
        let result = await ParentService.updateParent(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function deleteByParentId(req, res, next) {
    try {
        if (req && req.body && req.body.parentId) {
            let criteria = req.body;
            let result = await ParentService.deleteByParentId(criteria);
            res.json(result);
        } else {
            res.json({
                success: false,
                status: helper.error.status.InternalServerError,
                message: helper.error.message.insufficientData
            })
        }
    } catch (e) {
        res.json(e);
    }
}

async function getDistinctParent(req, res, next) {
    try {
        let result = await ParentService.getDistinctParent(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}