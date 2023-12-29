const QuestionController = require("../controllers/question.controller");
const helper = require('../utility');

module.exports = function (router) {
    router.post('/tech/question/add', helper.util.authenticationMiddleware, QuestionController.addQuestion);
    router.post('/tech/question/getAll', helper.util.authenticationMiddleware, QuestionController.getQuestion);
    router.post('/tech/question/deleteById', helper.util.authenticationMiddleware, QuestionController.deleteByQuestionId);
    router.post('/tech/question/update', helper.util.authenticationMiddleware, QuestionController.updateQuestion);
 }