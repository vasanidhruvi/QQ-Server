const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TechSchema = new Schema({ 
    techId: { type: String, required: true, unique: true },
    techName: { type: String, required: true},
    techInfo: { type: String, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: false },
    level: [{ type: String }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parent',
        required: true
    },
    techurl: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfiles',
        required: true
    },
}, { collection: 'tech' })

module.exports = mongoose.model('tech', TechSchema);