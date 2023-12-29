const ParentController = require("../controllers/parent.controller");
const helper = require('../utility');

module.exports = function (router) { 
    router.post('/tech/parent/getAll', helper.util.authenticationMiddleware, ParentController.getAllParent);
    router.post('/tech/parent/add', helper.util.authenticationMiddleware, ParentController.addParent);
    router.post('/tech/parent/update', helper.util.authenticationMiddleware, ParentController.updateParent);
    router.post('/tech/parent/deleteById', helper.util.authenticationMiddleware, ParentController.deleteByParentId);
    router.post('/tech/getDistinctParent', helper.util.authenticationMiddleware, ParentController.getDistinctParent);
}

