const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({ 
    questionId: { type: String, required: true, unique: true },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parent',
        required: true
    },
    technology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tech',
        required: true
    },
    level: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfiles',
        required: true
    },
}, { collection: 'questionAnswer' })

module.exports = mongoose.model('questionAnswer', QuestionSchema);