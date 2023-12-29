const UserService = require('../../services/users/user.service')

module.exports = {
    getUsers,
    getByUserId,
    update,
    deleteById,
    changePassword
}

async function getUsers(req, res, next) {
    try {
        let result = await UserService.getUsers(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getByUserId(req, res, next) {
    try {
        let result = await UserService.getByUserId(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function update(req, res, next) {
    try {
        let result = await UserService.update(req);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function deleteById(req, res, next) {
    try {
        if (req && req.body && req.body.userId) {
            let criteria = req.body;
            let result = await UserService.deleteById(criteria);
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

async function changePassword(req, res, next) {
    try {
        let result = await UserService.changePassword(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}