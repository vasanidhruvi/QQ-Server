const TechController = require("../controllers/tech.controller");
const QuizController = require("../controllers/quiz.controller");
const ParentController = require("../controllers/parent.controller");
const QuestionController = require("../controllers/question.controller");

module.exports = function (router) {
    router.post('/tech/getDistinctParent', ParentController.getDistinctParent);
    router.post('tech/getQuestionCountByLevel', QuestionController.getQuestionCountByLevel)
    router.post('/tech/parent/getTechByParentName', TechController.getTechByParentName);
    router.post('/tech/getQuestionByTechName', QuestionController.getUserQuestion);
    router.post('/tech/getTechImage', TechController.getTechImage);
    router.post('/tech/getClieneDashboardGraph1', TechController.getClieneDashboardGraph1);
    router.post('/tech/getClieneDashboardGraph2', TechController.getClieneDashboardGraph2);
    router.post('/tech/getAllForClientSide', TechController.getAll);
    router.post('/quiz/getAllByTechName', QuizController.getAllByTechName)
    router.post('/quiz/getQuestionByQuizData', QuizController.getQuestionByQuizData)
    router.post('/quiz/getAllQuiz', QuizController.getAllQuiz)
}