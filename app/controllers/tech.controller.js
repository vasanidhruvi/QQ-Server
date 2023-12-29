const TechService = require('../services/tech.service');
const helper = require('../middleware/utils');

module.exports = {
    getAll,
    add,
    update,
    deleteById,
    getByTechName,
    getTechByParentName,
    getTechImage,
    getClieneDashboardGraph1,
    getClieneDashboardGraph2,
    getParentDashboardGraph1
}

async function getAll(req, res, next) {
    try {
        let result = await TechService.getAll(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getTechByParentName(req,res, next){
    try {
        let result = await TechService.getTechByParentName(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getByTechName(req, res, next) {
    try {
        if (req && req.body && req.body.techName) {
            let result = await TechService.getByTechName(req.body);
            res.json(result);
        } else {
            res.json({
                success: false,
                message: 'Technology Name not provided!'
            })
        }
    } catch (e) {
        res.json(e);
    }
}

async function getTechImage(req, res, next) {
    try {
        let result = await TechService.getTechImage(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getClieneDashboardGraph1(req, res, next) {
    try {
        let result = await TechService.getClieneDashboardGraph1(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getClieneDashboardGraph2(req, res, next) {
    try {
        let result = await TechService.getClieneDashboardGraph2(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getParentDashboardGraph1(req, res, next) {
    try {
        let result = await TechService.getParentDashboardGraph1(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function add(req, res, next) {
    try {
        let criteria = req.body;
        criteria['userId'] = helper.getUserIdFromRequest(req);
        let result = await TechService.add(criteria);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function update(req, res, next) {
    try {
        let result = await TechService.update(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function deleteById(req, res, next) {
    try {
        if (req && req.body && req.body.techId) {
            let criteria = req.body;
            let result = await TechService.deleteById(criteria);
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