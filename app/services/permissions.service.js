const PermissionCollection = require('../models/permissions');
const ObjectId = require('mongoose').Types.ObjectId;
const helpers = require('../utility');

module.exports = {
    getBy,
    update
}

function getBy() {
    let promiseFunction = async (resolve, reject) => {
        try {
            let permission = await PermissionCollection.findOne({}).lean().exec();
            resolve({ success: true, message: 'success!', data: permission });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function update(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let permission = await PermissionCollection.findOne({}).lean().exec();
            if (permission && permission.permissionAccess) {
                let q = { permissionAccess: criteria };
                await PermissionCollection.findByIdAndUpdate(permission._id, q, {upsert: false}).exec();
            } else {
                let data = await PermissionCollection({
                    permissionAccess: criteria
                })
                await data.save();
            }
            resolve({ success: true, message: 'success!', });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}