const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthToken = new Schema({
    accessToken: { type: String },
    refreshToken: { type: String },
    lastActivityAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    idp: { type: String },
    nameID: { type: String }, // Don't show anywhere
    sessionIndex: { type: String }, // Don't show anywhere
    role: { type: String },
    userId: { type: String, required: true }
}, {
    collection: 'auth_token',
    timestamps: true
});

module.exports = mongoose.model('auth_token', AuthToken);