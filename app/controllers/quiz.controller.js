const QuizService = require('../services/quiz.service');
const helper = require('../middleware/utils');

module.exports = {
    add,
    getAll,
    getAllByTechName,
    update,
    deleteById,
    addQuestion,
    getAllQuestionById,
    updateQuestion,
    deleteByQuestionId,
    getQuestionByQuizData,
    getAllQuiz
}

async function getAllByTechName(req, res, next) {
    try {
        if(req && req.body && req.body.technology){
            let result = await QuizService.getAllByTechName(req.body);
            res.json(result);
        }else{
            res.json({
                success: false,
                message: "Technology not Provided!"
            })
        }
    } catch (e) {
        res.json(e);
    }
}

async function getAllQuiz(req, res, next) {
    try {
        let result = await QuizService.getAllQuiz(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getQuestionByQuizData(req, res, next) {
    try {
        let result = await QuizService.getQuestionByQuizData(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getAll(req, res, next) {
    try {
        let result = await QuizService.getAll(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function add(req, res, next) {
    try {
        let criteria = req.body;
        criteria['userId'] = helper.getUserIdFromRequest(req);
        let result = await QuizService.add(criteria);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function update(req, res, next) {
    try {
        let result = await QuizService.update(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function deleteById(req, res, next) {
    try {
        if (req && req.body && req.body.quizId) {
            let criteria = req.body;
            let result = await QuizService.deleteById(criteria);
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

async function deleteByQuestionId(req, res, next) {
    try {
        if (req && req.body && req.body.quizId) {
            let criteria = req.body;
            let result = await QuizService.deleteByQuestionId(criteria);
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

async function addQuestion(req, res, next) {
    try {
        let criteria = req.body;
        criteria['userId'] = helper.getUserIdFromRequest(req);
        let result = await QuizService.addQuestion(criteria);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function getAllQuestionById(req, res, next) {
    try {
        let result = await QuizService.getAllQuestionById(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}

async function updateQuestion(req, res, next) {
    try {
        let result = await QuizService.updateQuestion(req.body);
        res.json(result);
    } catch (e) {
        res.json(e);
    }
}