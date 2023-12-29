const TechController = require("../controllers/tech.controller");
const helper = require('../utility');

module.exports = function (router) {
    router.post('/tech/getAll', helper.util.authenticationMiddleware, TechController.getAll);
    router.post('/tech/getByTechName', helper.util.authenticationMiddleware, TechController.getByTechName)
    router.post('/tech/add', helper.util.authenticationMiddleware, TechController.add);
    router.post('/tech/parent/getTechByParentName', helper.util.authenticationMiddleware, TechController.getTechByParentName);
    router.post('/tech/update', helper.util.authenticationMiddleware, TechController.update);
    router.post('/tech/deleteById', helper.util.authenticationMiddleware, TechController.deleteById);
    router.post('/tech/getParentDashboardGraph1', TechController.getParentDashboardGraph1);
}