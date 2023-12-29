const TechCollection = require('../models/tech.model');
const ParentCollection = require('../models/parent.model');
const UserCollection = require('../models/user');
const QuestionCollection = require('../models/question.modal')
const helper = require('../middleware/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const helpers = require('../utility');

module.exports = { 
    addQuestion,
    getQuestion,
    deleteByQuestionId,
    updateQuestion,
    getQuestionCountByLevel,
    getUserQuestion,

}

function addQuestion(criteria){

    let promiseFunction = async (resolve, reject) => {
        try {

            if (criteria && criteria.userId && criteria.parent && criteria.technology && criteria.level && criteria.question) {

                let isExists = await QuestionCollection.findOne({ question: criteria.question }).lean().exec();
                if (isExists && isExists.questionId) {
                    reject({ success: false, message: 'Data already exists!' });
                    return;
                }

                let user = await UserCollection.findOne({ userId: criteria.userId }, { _id: 1 }).lean().exec();

                let questionData = await QuestionCollection({
                    user: user,
                    parent: criteria.parent,
                    technology: criteria.technology,
                    level: criteria.level,
                    question: criteria.question,
                    answer: criteria.answer,
                });

                let questionId = await helper.generateCounterId('question', 'questionId', 'QQQA_');
                if (questionId) {
                    questionData['questionId'] = questionId;

                    await questionData.save();

                    resolve({ success: true, message: 'Question Answer Added Successfully!' });
                } else {
                    reject({ success: false, message: 'Error while generating Unique Question Answer ID!' });
                    return;
                }
                
             }else {
                reject({ success: false, message: 'Data not Provided!' });
                return;
            }
        }catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);

}

function getQuestion(criteria){
    let promiseFunction = async (resolve, reject) => {
        try {
            let condition = [];
            if (criteria) { 
                if (criteria._id) {
                    condition.push({ $match: { _id: new ObjectId(criteria._id) } });
                }
                if (criteria.questionId) {
                    condition.push({ $match: { questionId: criteria.questionId } });
                }
                if (criteria.parent) {
                    condition.push({ $match: { parent: criteria.parent } });
                }
                if (criteria.technology) {
                    condition.push({ $match: { technology: new ObjectId(criteria.technology) } });
                }
                if (criteria.level) {
                    condition.push({ $match: { level: criteria.level } });
                }
                if (criteria.question) {
                    condition.push({ $match: { question: criteria.question } });
                }
                if (criteria.answer) {
                    condition.push({ $match: { answer: criteria.answer } });
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

            let lookupParent = {
                $lookup:
                {
                    from: 'parent',
                    localField: 'parent',
                    foreignField: '_id',
                    // "pipeline": [
                    //     { "$project": { "parentName": 1 } }
                    // ],
                    as: 'parent'
                }
            }
            condition.push(lookupParent)
            condition.push({
                $unwind: '$parent' // Unwind the user array created by $lookup
            })

            let lookupTech = {
                $lookup:
                {
                    from: 'tech',
                    localField: 'technology',
                    foreignField: '_id',
                    // "pipeline": [
                    //     { "$project": { "parentName": 1 } }
                    // ],
                    as: 'technology'
                }
            }
            condition.push(lookupTech)
            condition.push({
                $unwind: '$technology' // Unwind the user array created by $lookup
            })

            let questionList = await QuestionCollection.aggregate(condition).exec();

            if (criteria && ((criteria.parent && typeof criteria.parent !== 'object') || criteria._id)) {
                questionList = (questionList && questionList.length) ? questionList[0] : {};
            }
            resolve({ success: true, message: 'success!', data: questionList });
        }
        catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);

}

function deleteByQuestionId(criteria){
    let promiseFunction = async (resolve, reject) => {
        try {
            let dbTech = await QuestionCollection.findOne({ questionId: criteria.questionId }).exec();
            if (!dbTech) {
                return reject({ success: false, status: helpers.error.status.NotFound, message: helpers.error.message.NotFound });
            }
            try {
                await dbTech.deleteOne();
            } catch (e) {
                return reject({ success: false, status: helpers.error.status.InternalServerError, message: helpers.error.message.InternalServerError, error: e });
            }
            resolve({ success: true, status: helpers.success.status.OK, message: 'Question Answer deleted successfully!' });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)

}

function updateQuestion(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (criteria && criteria.questionId) {
            delete criteria._id;
            delete criteria.__v;
            let q = { questionId: criteria.questionId };
            try {
                let result = await QuestionCollection.findOneAndUpdate(q, criteria, { upsert: false }).exec();
                result = result.toJSON();
                resolve({ success: true, message: 'Question Answer updated successfully!', data: result });
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helper.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helper.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function getQuestionCountByLevel(criteria){
    let promiseFunction = async (resolve, reject) => {
        try {
            let dbTech = await QuestionCollection.findOne({ level: criteria.level }).exec();
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

function getUserQuestion(req, res){
    let promiseFunction = async (resolve, reject) => {
        // try {
        //     let isExists = await TechCollection.findOne({ techName: criteria.techName }, { _id: 1 }).lean().exec();
        //     if(isExists && isExists._id){
        //         let data = {
        //             technology: new ObjectId(isExists._id),
        //             level: criteria.level
        //         }
        //         let questionList = await QuestionCollection.find(data, { questionId: 1, question: 1, answer: 1 }).exec();
        //         // let questionList = await getQuestion(data);
        //         resolve({ success: true, message: 'success!', data: questionList });
        //         // resolve(questionList)
        //     }

            const page = parseInt(req.body.pageQuery) || 1; // Page number from the request query, default is 1
            const pageSize = 1; // Number of records per page

            try {
            let isExists = await TechCollection.findOne({ techName: req.body.techName }, { _id: 1 }).lean().exec();
                const totalCount = await QuestionCollection.countDocuments(
                {
                     technology: new ObjectId(isExists._id),
                     level: req.body.level
                 }
                );
                const totalPages = Math.ceil(totalCount / pageSize);

                const skip = (page - 1) * pageSize;
                const records = await QuestionCollection.find({
                    technology: new ObjectId(isExists._id),
                    level: req.body.level
                }).sort({ questionId: 1 }).skip(skip).limit(pageSize);

                res.json({
                success: true,
                records,
                currentPage: page,
                totalPages,
                totalCount,
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        // }
        // catch (err) {
        //     reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        // }
    }
    return new Promise(promiseFunction);
    
}