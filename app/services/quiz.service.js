const UserCollection = require('../models/user');
const helper = require('../middleware/utils');
const ObjectId = require('mongoose').Types.ObjectId;
const helpers = require('../utility');
const QuizCollection = require('../models/quiz.model');

module.exports = {
    add,
    getAll,
    update,
    getAllByTechName,
    deleteById,
    addQuestion,
    getAllQuestionById,
    updateQuestion,
    deleteByQuestionId,
    getQuestionByQuizData,
    getAllQuiz
}

function getAllByTechName(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let quizList = await QuizCollection
                .find({ technology: criteria.technology }, { quizName: 1, noofquestion: 1 })
                .exec();
            resolve({ success: true, message: 'success!', data: quizList });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function getAllQuiz(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let quizList = await QuizCollection
                .find({ }, { quizName: 1, noofquestion: 1, technology: 1 })
                .exec();
            resolve({ success: true, message: 'success!', data: quizList });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function getAll(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let condition = [];
            if (criteria) {
                if (criteria._id) {
                    condition.push({ $match: { _id: new ObjectId(criteria._id) } });
                }
                if (criteria.quizId) {
                    condition.push({ $match: { quizId: criteria.quizId } });
                }
                if (criteria.quizName) {
                    condition.push({ $match: { quizName: criteria.quizName } });
                }
                if (criteria.technology) {
                    condition.push({ $match: { technology: criteria.technology } });
                }
                if (criteria.noofquestion) {
                    condition.push({ $match: { noofquestion: criteria.noofquestion } });
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

            let quizList = await QuizCollection.aggregate(condition).exec();

            if (criteria && ((criteria.quizName && typeof criteria.quizName !== 'object') || criteria._id)) {
                quizList = (quizList && quizList.length) ? quizList[0] : {};
            }
            resolve({ success: true, message: 'success!', data: quizList });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}

function getQuestionByQuizData(criteria) {
    let promiseFunction = async (resolve, reject) => {

        try {
            let isExists = await QuizCollection.findOne({ _id: new ObjectId(criteria.quizId._id) }).lean().exec();
            const totalCount = isExists.questionData.length;

            resolve({ success: true, message: 'success!', data: isExists, totalCount });
        } catch (error) {
            console.error(error);
            reject({ success: false, message: 'Some unhandled server error has occurred', error: error });
        }
    }
    return new Promise(promiseFunction);

}

function add(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {

            if (criteria && criteria.userId && criteria.quizName && criteria.technology) {

                let isExists = await QuizCollection.findOne({ quizName: criteria.quizName }).lean().exec();
                if (isExists && isExists.quizId) {
                    reject({ success: false, message: 'Data already exists!' });
                    return;
                }

                let user = await UserCollection.findOne({ userId: criteria.userId }, { _id: 1 }).lean().exec();

                let quizData = await QuizCollection({
                    user: user,
                    quizName: criteria.quizName,
                    technology: criteria.technology,
                    noofquestion: criteria.noofquestion,
                });

                let quizId = await helper.generateCounterId('quiz', 'quizId', 'QQz_');
                if (quizId) {
                    quizData['quizId'] = quizId;

                    await quizData.save();

                    resolve({ success: true, message: 'Quiz Added Successfully!' });
                } else {
                    reject({ success: false, message: 'Error while generating Unique Quiz ID!' });
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
        if (criteria && criteria.quizId) {
            delete criteria._id;
            delete criteria.__v;
            let q = { quizId: criteria.quizId };
            try {
                let result = await QuizCollection.findOneAndUpdate(q, criteria, { upsert: false }).exec();
                result = result.toJSON();
                resolve({ success: true, message: 'Quiz updated successfully!', data: result });
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helpers.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helpers.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function deleteById(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let dbTech = await QuizCollection.findOne({ quizId: criteria.quizId }).exec();
            if (!dbTech) {
                return reject({ success: false, status: helpers.error.status.NotFound, message: helpers.error.message.NotFound });
            }
            try {
                await dbTech.deleteOne();
            } catch (e) {
                return reject({ success: false, status: helpers.error.status.InternalServerError, message: helpers.error.message.InternalServerError, error: e });
            }
            resolve({ success: true, status: helpers.success.status.OK, message: 'Quiz deleted successfully!' });
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)

}

function addQuestion(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (criteria && criteria.quizId) {
            let q = { quizId: criteria.quizId };
            try {
                let quizData = await QuizCollection.findOne(q).lean().exec();
                if (quizData && quizData.quizId && quizData.quizName) {
                    let questionObj = {};
                    if (criteria.question) questionObj['question'] = criteria.question;
                    if (criteria.answerA) questionObj['answerA'] = criteria.answerA;
                    if (criteria.answerB) questionObj['answerB'] = criteria.answerB;
                    if (criteria.answerC) questionObj['answerC'] = criteria.answerC;
                    if (criteria.answerD) questionObj['answerD'] = criteria.answerD;
                    if (criteria.correctAnswer) questionObj['correctAnswer'] = criteria.correctAnswer;


                    if (quizData && quizData.questionData && quizData.questionData.length) {
                        quizData.questionData.push(questionObj)
                    } else {
                        quizData['questionData'] = [questionObj];
                    }

                    let result = await QuizCollection.findOneAndUpdate(q, quizData).exec();
                    resolve({ success: true, message: 'Quiz updated successfully!', data: result });
                } else {
                    reject({ success: false, message: 'Invalid Quiz Id!', });
                }
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helpers.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helpers.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function getAllQuestionById(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (criteria && criteria.quizId) {
            let q = { quizId: criteria.quizId };
            try {
                let quizData = await QuizCollection.findOne(q).lean().exec();
                resolve({ success: true, message: 'Success', data: quizData });
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helpers.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helpers.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function updateQuestion(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (criteria && criteria.quizId) {
            let q = { quizId: criteria.quizId };
            try {
                let quizData = await QuizCollection.findOne(q).lean().exec();
                if (quizData && quizData.questionData) {
                    let questionId = quizData.questionData.findIndex((x) => x.question === criteria.question);
                    if (questionId > -1) {
                        if (criteria.answerA) quizData.questionData[questionId]['answerA'] = criteria.answerA;
                        if (criteria.answerB) quizData.questionData[questionId]['answerB'] = criteria.answerB;
                        if (criteria.answerC) quizData.questionData[questionId]['answerC'] = criteria.answerC;
                        if (criteria.answerD) quizData.questionData[questionId]['answerD'] = criteria.answerD;
                        if (criteria.correctAnswer) quizData.questionData[questionId]['correctAnswer'] = criteria.correctAnswer;

                        let result = await QuizCollection.findOneAndUpdate(q, quizData).exec();
                        resolve({ success: true, message: 'Quiz updated successfully!', data: result });
                    }
                } else {
                    reject({ success: false, message: 'Invalid Quiz Id!', });
                }
            } catch (err) {
                reject({ success: false, message: err && err.message ? err.message : helpers.error.message.InternalServerError, error: err });
            }
        } else {
            reject({ success: false, message: helpers.error.message.insufficientData, error: '' });
        }
    }
    return new Promise(promiseFunction);
}

function deleteByQuestionId(criteria) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let quizData = await QuizCollection.findOne({ quizId: criteria.quizId }).lean().exec();
            if (!quizData) {
                return reject({ success: false, status: helpers.error.status.NotFound, message: helpers.error.message.NotFound });
            }
            try {
                if (quizData && quizData.questionData && quizData.questionData.length) {
                    let id = quizData.questionData.findIndex((x) => x._id.equals(criteria.questionId));
                    if (id > -1) {
                        quizData.questionData.splice(id, 1);
                    }
                    await QuizCollection.findOneAndUpdate({ quizId: criteria.quizId }, quizData).exec();
                    resolve({ success: true, message: 'Quiz updated successfully!' });
                } else {
                    reject({ success: false, message: 'Invalid Quiz Id!', });
                }
            } catch (e) {
                return reject({ success: false, status: helpers.error.status.InternalServerError, message: helpers.error.message.InternalServerError, error: e });
            }
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction)

}