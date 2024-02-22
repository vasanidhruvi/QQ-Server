const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const QuizSchema = new Schema({ 
    quizId: { type: String, required: true, unique: true },    
    quizName: { type: String, required: true },    
    technology: { type: String, required: true},
    // level: { type: String, required: true},
    questionData: [
        {
            question: { type: String},
            answerA: { type: String },
            answerB: { type: String },
            answerC: { type: String },
            answerD: { type: String },
            correctAnswer: { type: String }
        }
    ],
    noofquestion: { type: Number, required: true},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfiles',
        required: true
    },
}, { collection: 'quiz' })

module.exports = mongoose.model('quiz', QuizSchema);