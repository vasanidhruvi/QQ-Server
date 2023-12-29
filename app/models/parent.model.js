const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ParentSchema = new Schema({ 
    parentId: { type: String, required: true, unique: true },
    parentName: { type: String, required: true},
    parentInfo: { type: String, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: false },
    parentUrl: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userProfiles',
        required: true
    },
}, { collection: 'parent' })

module.exports = mongoose.model('parent', ParentSchema);