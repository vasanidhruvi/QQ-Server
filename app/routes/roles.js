const RoleController = require("../controllers/roles/role.controller");
const helper = require('../utility');

module.exports = function (router) {
    router.post('/role/getAll', helper.util.authenticationMiddleware, RoleController.getAll);
    router.post('/role/getByRoleId', helper.util.authenticationMiddleware, RoleController.getByRoleId);
    router.post('/role/add', helper.util.authenticationMiddleware, RoleController.add);
    router.post('/role/update', helper.util.authenticationMiddleware, RoleController.update);
    router.post('/role/deleteById', helper.util.authenticationMiddleware, RoleController.deleteById);
}