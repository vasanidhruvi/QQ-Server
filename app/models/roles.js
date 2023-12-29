const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const RolesSchema = new Schema({ 
    rolesId: { type: String, required: true, unique: true },
    roleName: { type: String, required: true},
    displayName: { type: String, required: true },
    roleLevel: { type: Number, default: 0 },
    isActive: { type: Boolean, default: false },
    isDeletable: { type: Boolean, default: false }
}, { collection: 'roles' })

module.exports = mongoose.model('roles', RolesSchema);