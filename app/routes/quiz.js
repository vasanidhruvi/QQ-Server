const QuizController = require("../controllers/quiz.controller");
const helper = require('../utility');

module.exports = function (router) { 
    router.post('/quiz/add', helper.util.authenticationMiddleware, QuizController.add);
    router.post('/quiz/getAll', helper.util.authenticationMiddleware, QuizController.getAll);
    router.post('/quiz/update', helper.util.authenticationMiddleware, QuizController.update);
    router.post('/quiz/deleteById', helper.util.authenticationMiddleware, QuizController.deleteById);
    router.post('/quiz/addQuestion', helper.util.authenticationMiddleware, QuizController.addQuestion);
    router.post('/quiz/getAllQuestionById', helper.util.authenticationMiddleware, QuizController.getAllQuestionById);
    router.post('/quiz/updateQuestion', helper.util.authenticationMiddleware, QuizController.updateQuestion);
    router.post('/quiz/question/deleteById', helper.util.authenticationMiddleware, QuizController.deleteByQuestionId);
}