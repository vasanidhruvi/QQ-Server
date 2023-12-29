const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({ 
    permissionAccess: { type: Schema.Types.Mixed }
}, { collection: 'permissions' })

module.exports = mongoose.model('permissions', PermissionSchema);