const TechCollection = require('../models/tech.model');
const ParentCollection = require('../models/parent.model');
const UserCollection = require('../models/user');
const QuestionCollection = require('../models/question.modal')
const helper = require('../middleware/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const helpers = require('../utility');

module.exports = {
    getAllParent,
    addParent,
    updateParent,
    deleteByParentId,
    getDistinctParent,

}

function getAllParent(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let condition = [];
            if (criteria) {
                if (criteria._id) {
                    condition.push({ $match: { _id: new ObjectId(criteria._id) } });
                }
                if (criteria.parentId) {
                    condition.push({ $match: { parentId: criteria.parentId } });
                }
                if (criteria.parentName) {
                    condition.push({ $match: { parentName: criteria.parentName } });
                }
                if (criteria.parentInfo) {
                    condition.push({ $match: { parentInfo: criteria.parentInfo } });
                }
                if (criteria.parentUrl) {
                    condition.push({ $match: { parentUrl: criteria.parentUrl } });
                }
                if (criteria.url) {
                    condition.push({ $match: { url: criteria.url } });
                }
                if (criteria.breadcrumbs || criteria.breadcrumbs === false) {
                    condition.push({ $match: { breadcrumbs: criteria.breadcrumbs } });
                }
            }
            if (criteria && criteria.sort) {
                condition.push({ $sort: criteria.sort });
            } else {
                condition.push({ $sort: { updatedAt: 1 } });
            }
            let lookup = {
                $lookup:
                {
                    from: 'userProfiles',
                    localField: 'user',
                    foreignField: '_id',
                    "pipeline": [
                        { "$project": { "firstname": 1, "lastname": 1 } }
                    ],
                    as: 'user'
                }
            }
            condition.push(lookup)
            condition.push({
                $unwind: '$user' // Unwind the user array created by $lookup
            })

            let parentList = await ParentCollection.aggregate(condition).exec();

            if (criteria && ((criteria.parentName && typeof criteria.parentName !== 'object') || criteria._id)) {
                parentList = (parentList && parentList.length) ? parentList[0] : {};
            }
            resolve({ success: true, message: 'success!', data: parentList });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function addParent(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {

            if (criteria && criteria.userId && criteria.parentName) {

                let isExists = await ParentCollection.findOne({ parentName: criteria.parentName }).lean().exec();
                if (isExists && isExists.parentId) {
                    reject({ success: false, message: 'Data already exists!' });
                    return;
                }

                let user = await UserCollection.findOne({ userId: criteria.userId }, { _id: 1 }).lean().exec();

                let parentData = await ParentCollection({
                    user: user,
                    parentName: criteria.parentName,
                    parentInfo: criteria.parentInfo,
                    isActive: criteria.isActiveParent,
                    image: criteria.image,
                    parentUrl: criteria.parentUrl,
                });

                let parentId = await helper.generateCounterId('parent', 'parentId', 'QQP_');
                if (parentId) {
                    parentData['parentId'] = parentId;

                    await parentData.save();

                    resolve({ success: true, message: 'Parent Added Successfully!' });
                } else {
                    reject({ success: false, message: 'Error while generating Unique Parent ID!' });
                    return;
                }

            } else {
                reject({ success: false, message: 'Data not Provided!' });
                return;
            }

        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function updateParent(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (criteria && criteria.parentId) {
            delete criteria._id;
            delete criteria.__v;
            let q = { parentId: criteria.parentId };
            try {
                let result = await ParentCollection.findOneAndUpdate(q, criteria, { upsert: false }).exec();
                result = result.toJSON();
                resolve({ success: true, message: 'Parent updated successfully!', data: result });
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helper.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helper.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function deleteByParentId(criteria){
    let promiseFunction = async (resolve, reject) => {
        try {
            let dbTech = await ParentCollection.findOne({ parentId: criteria.parentId }).exec();
            if (!dbTech) {
                return reject({ success: false, status: helpers.error.status.NotFound, message: helpers.error.message.NotFound });
            }
            try {
                await dbTech.deleteOne();
            } catch (e) {
                return reject({ success: false, status: helpers.error.status.InternalServerError, message: helpers.error.message.InternalServerError, error: e });
            }
            resolve({ success: true, status: helpers.success.status.OK, message: 'Parent deleted successfully!' });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)

}

function getDistinctParent(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let parentData = await ParentCollection.
                find({ isActive: true }, { image: 1, parentUrl: 1, parentName: 1 }).
                sort({ parentName: 1 }).
                exec();

            resolve({ success: true, message: 'success!', data: parentData });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}