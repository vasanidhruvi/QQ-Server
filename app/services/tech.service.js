const TechCollection = require('../models/tech.model');
const ParentCollection = require('../models/parent.model');
const UserCollection = require('../models/user');
const QuestionCollection = require('../models/question.modal')
const helper = require('../middleware/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const helpers = require('../utility');

module.exports = {
    getAll,
    getTechByParentName,
    add,
    update,
    deleteById,
    getByTechName,
    getTechImage,
    getClieneDashboardGraph1,
    getClieneDashboardGraph2,
    getParentDashboardGraph1
}

function getAll(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let condition = [];
            if (criteria) {
                if (criteria._id) {
                    condition.push({ $match: { _id: new ObjectId(criteria._id) } });
                }
                if (criteria.techId) {
                    condition.push({ $match: { techId: criteria.techId } });
                }
                if (criteria.techName) {
                    condition.push({ $match: { techName: criteria.techName } });
                }
                if (criteria.techInfo) {
                    condition.push({ $match: { techInfo: criteria.techInfo } });
                }
                if (criteria.parent) {
                    condition.push({ $match: { parent: new ObjectId(criteria.parent) } });
                }
                if (criteria.techurl) {
                    condition.push({ $match: { techurl: criteria.techurl } });
                }
                if (criteria.url) {
                    condition.push({ $match: { url: criteria.url } });
                }
                if (criteria.breadcrumbs || criteria.breadcrumbs === false) {
                    condition.push({ $match: { breadcrumbs: criteria.breadcrumbs } });
                }

                if (criteria.fieldsToSelect) {
                    condition.push({ $project: criteria.fieldsToSelect });
                }
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
            condition.push(
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
            )

            let lookupParent = {
                $lookup:
                {
                    from: 'parent',
                    localField: 'parent',
                    foreignField: '_id',
                    "pipeline": [
                        { "$project": { "parentName": 1 } }
                    ],
                    as: 'parent'
                }
            }
            condition.push(lookupParent)
            condition.push(
                { $unwind: { path: '$parent', preserveNullAndEmptyArrays: true } }
            )

            if (criteria && criteria.sort) {
                condition.push({ $sort: criteria.sort });
            } else {
                condition.push({ $sort: { updatedAt: 1 } });
            }

            let techList = await TechCollection.aggregate(condition).exec();

            if (criteria && ((criteria.techName && typeof criteria.techName !== 'object') || criteria._id)) {
                techList = (techList && techList.length) ? techList[0] : {};
            }
            resolve({ success: true, message: 'success!', data: techList });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function getTechByParentName(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            if (criteria && criteria.parentName) {
                let condition = [];
                let lookupParent = {
                    $lookup:
                    {
                        from: 'parent',
                        localField: 'parent',
                        foreignField: '_id',
                        "pipeline": [
                            { "$match": { "parentName": criteria.parentName } }
                        ],
                        as: 'parent'
                    }
                }
                condition.push(lookupParent)
                condition.push({
                    $unwind: '$parent' // Unwind the user array created by $lookup
                })
                condition.push(
                    { "$match": { isActive: true } },
                    { "$project": { techName: 1, image: 1, techurl: 1, parent: 1, level: 1 } }
                )

                let techList = await TechCollection.
                    aggregate(condition).
                    sort({ techName: 1 }).
                    exec();

                resolve({ success: true, message: 'success!', data: techList });
            } else {
                reject({ success: false, message: 'Pass Parent name to fetch records!', error: err });
                return;
            }
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}

function add(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {

            if (criteria && criteria.userId && criteria.techName && criteria.parent) {

                let isExists = await TechCollection.findOne({ techName: criteria.techName, parent: criteria.parent }).lean().exec();
                if (isExists && isExists.techId) {
                    reject({ success: false, message: 'Data already exists!' });
                    return;
                }

                let user = await UserCollection.findOne({ userId: criteria.userId }, { _id: 1 }).lean().exec();

                let techData = await TechCollection({
                    user: user,
                    techName: criteria.techName,
                    techInfo: criteria.techInfo,
                    parent: criteria.parent,
                    isActive: criteria.isActive,
                    image: criteria.image,
                    level: criteria.level,
                    techurl: criteria.techurl,
                });

                let techId = await helper.generateCounterId('tech', 'techId', 'QQT_');
                if (techId) {
                    techData['techId'] = techId;

                    await techData.save();

                    resolve({ success: true, message: 'Technology Added Successfully!' });
                } else {
                    reject({ success: false, message: 'Error while generating Unique Technology ID!' });
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

function update(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (criteria && criteria.techId) {
            delete criteria._id;
            delete criteria.__v;
            let q = { techId: criteria.techId };
            try {
                let result = await TechCollection.findOneAndUpdate(q, criteria, { upsert: false }).exec();
                result = result.toJSON();
                resolve({ success: true, message: 'Technology updated successfully!', data: result });
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helper.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helper.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function deleteById(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let dbTech = await TechCollection.findOne({ techId: criteria.techId }).exec();
            if (!dbTech) {
                return reject({ success: false, status: helpers.error.status.NotFound, message: helpers.error.message.NotFound });
            }
            try {
                await dbTech.deleteOne();
            } catch (e) {
                return reject({ success: false, status: helpers.error.status.InternalServerError, message: helpers.error.message.InternalServerError, error: e });
            }
            resolve({ success: true, status: helpers.success.status.OK, message: 'Technology deleted successfully!' });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)

}

function getByTechName(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let technology = await TechCollection.findOne({ techName: criteria.techName })
                .populate('parent', ["_id", "parentName"])
                .exec();
            resolve({ success: true, data: technology })
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}

function getTechImage(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let technology = await TechCollection.findOne({ techName: criteria.techName }, { image: 1 })
                .exec();
            resolve({ success: true, data: technology })
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}

function getClieneDashboardGraph1(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            const result = await TechCollection.aggregate([
                {
                    $group: {
                        _id: '$parent',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'parent',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'parent'
                    }
                },
                {
                    $unwind: '$parent'
                },
                {
                    $project: {
                        parentName: '$parent.parentName',
                        count: 1,
                        _id: 0
                    }
                }
            ]);
            resolve({ success: true, data: result })
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}

function getClieneDashboardGraph2(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            const result = await QuestionCollection.aggregate([
                // {
                //     $match: {
                //       level: criteria.level
                //     }
                //   },
                {
                    $group: {
                        _id: '$technology',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'tech',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'techInfo'
                    }
                },
                {
                    $unwind: '$techInfo'
                },
                {
                    $project: {
                        techName: '$techInfo.techName',
                        count: 1,
                        _id: 0
                    }
                }
            ]);
            resolve({ success: true, data: result })
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}

function getParentDashboardGraph1(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let dbTech = await ParentCollection.findOne({ parentName: criteria.parentName }, { _id: 1 }).exec();
            const result = await QuestionCollection.aggregate([
                {
                    $match: {
                        parent: new ObjectId(dbTech._id)
                    }
                },
                {
                    $group: {
                        _id: '$technology',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'tech',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'techInfo'
                    }
                },
                {
                    $unwind: '$techInfo'
                },
                {
                    $project: {
                        techName: '$techInfo.techName',
                        count: 1,
                        _id: 0
                    }
                }
            ]);
            resolve({ success: true, data: result })
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)
}