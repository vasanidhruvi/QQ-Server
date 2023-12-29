const QuestionService = require('../services/question.service');
const helper = require('../middleware/utils');

module.exports = { 
    addQuestion,
    getQuestion,
    deleteByQuestionId,
    updateQuestion,
    getQuestionCountByLevel,
    getUserQuestion,
}

async function addQuestion(req, res, next) {
    try {
        let criteria = req.body;
        criteria['userId'] = helper.getUserIdFromRequest(req);
        let result = await QuestionService.addQuestion(criteria);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getQuestion(req, res, next) {
    try {
        let result = await QuestionService.getQuestion(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function deleteByQuestionId(req, res, next) {
    try {
        if (req && req.body && req.body.questionId) {
            let criteria = req.body;
            let result = await QuestionService.deleteByQuestionId(criteria);
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

async function updateQuestion(req, res, next) {
    try {
        let result = await QuestionService.updateQuestion(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getQuestionCountByLevel(req, res, next) {
    try {
        let result = await QuestionService.getQuestionCountByLevel(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getUserQuestion(req, res, next) {
    try {
        let result = await QuestionService.getUserQuestion(req, res);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}