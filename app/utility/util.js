const jwt = require('jsonwebtoken');
const AuthTokenCollection = require('../models/authToken.model');
const UserCollection = require('../models/user');
const RoleCollection = require('../models/roles');
const error = require('./error');

module.exports = {
    authenticationMiddleware,
    passwordGenerator
}

async function authenticationMiddleware(req, res, next) {
    let header = req.headers.authorization;

    if (header) {
        let prefix = header.split(' ')[0];
        let token = header.split(' ')[1];

        // check for autheticated user
        // route middleware to verify a token
        if (prefix == 'Bearer') {
            // decode token
            if (token) {
                // Check if token exist
                try {
                    let tokenList = await AuthTokenCollection.find({ $or: [{ accessToken: token }, { refreshToken: token }] }).exec();
                    if (tokenList && Array.isArray(tokenList) && tokenList.length > 0) {
                        // verifies secret and checks exp
                        jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
                            if (err) {
                                // let sessionTracker = new SessionTrackerCollection({
                                //     userId: tokenList[0].userId,
                                //     event: 'Logout',
                                //     userAgent: tokenList[0].userAgent,
                                //     token: tokenList[0].refreshToken
                                // });
                                // try {
                                //     await sessionTracker.save();
                                // } catch (error) {
                                //     console.error(error);
                                // }
                                return res.status(error.status.AuthenticationTimeout).json({
                                    error: error.message.AuthenticationTimeout,
                                    message: error.message.AuthenticationTimeout
                                });
                            } else {
                                let role = null;
                                try {
                                    // Mongoose Update
                                    role = await RoleCollection.findOne({ roleName: tokenList[0].role })
                                        .populate({ path: 'permissionAccessesRefId', select: 'permissionAccesses' })
                                        .lean().exec();
                                    if (!role || !role.isActive) {
                                        return res.status(error.status.Forbidden).json({
                                            error: error.message.Forbidden,
                                            message: error.message.Forbidden
                                        });
                                    }
                                } catch (e) {
                                    return sendError(e, res, next);
                                }
                                if (req.headers.userid && tokenList[0].userId && req.headers.userid !== tokenList[0].userId) {
                                    return res.status(error.status.Forbidden).json({
                                        error: error.message.Forbidden,
                                        message: error.message.Forbidden
                                    });
                                }
                                // Check access for route
                                // if (role.permissionAccessesRefId && role.permissionAccessesRefId.length) {
                                //     role['modulesAccess'] = role.permissionAccessesRefId[0].permissionAccesses;
                                //     delete role.permissionAccessesRefId;
                                // }
                                // let hasAccess = routAccess.hasAccess(role.modulesAccess, req.route.path);
                                // if (hasAccess || role.rolelevel === 0) {
                                if (role.roleLevel > 0) {
                                    // Update Last Activity
                                    let dbToken = tokenList[0];
                                    dbToken.lastActivityAt = new Date();
                                    try {
                                        await dbToken.save();
                                    } catch (err) {
                                        return sendError(err, res, next);
                                    }
                                    // if everything is good, save to request for use in other routes
                                    req.decoded = decoded;
                                    next();
                                } else {
                                    return res.status(error.status.Forbidden).json({
                                        error: error.message.Forbidden,
                                        message: error.message.Forbidden
                                    });
                                }
                            }
                        });
                    } else {
                        return res.status(error.status.Unauthorized).json({
                            error: error.message.Unauthorized,
                            message: error.message.Unauthorized
                        });
                    }
                } catch (err) {
                    return res.status(error.status.Unauthorized).json({
                        error: error.message.Unauthorized,
                        message: error.message.Unauthorized
                    });
                }
            } else {
                // if there is no token
                // return an error
                return res.status(error.status.Forbidden).json({
                    error: error.message.Forbidden,
                    message: error.message.Forbidden
                });
            }
        } else if (prefix == 'Basic') {
            if (token) {
                let buf = new Buffer.from(token, 'base64');
                let loginCredentials = {};
                loginCredentials.email = buf.toString().split(':')[0];
                loginCredentials.password = buf.toString().split(':')[1];

                // find user based on email who is active and not deleted
                try {
                    let user = await UserCollection.findOne({ email: loginCredentials.email }).exec();
                    if (!user) {
                        // if no user found based on email,
                        // then it will return error in response
                        return res.status(error.status.Forbidden).json({
                            error: error.message.Forbidden,
                            message: error.message.Forbidden
                        });
                    } else {
                        //Check if password matches
                        let compare = user.password === loginCredentials.password;
                        // let compare = user.comparePassword(loginCredentials.password);
                        //Password matched
                        if (compare) {
                            try {
                                let role = await RoleCollection.findById(user.role).populate({ path: 'permissionAccessesRefId', select: 'permissionAccesses' })
                                    .lean().exec();
                                if (!role) {
                                    return res.status(error.status.Unauthorized).json({
                                        success: false,
                                        message: error.message.roleNotFound
                                    });
                                } else {
                                    next();
                                    // Check access for route
                                    // if (role.permissionAccessesRefId && role.permissionAccessesRefId.length) {
                                    //     role['modulesAccess'] = role.permissionAccessesRefId[0].permissionAccesses;
                                    //     delete role.permissionAccessesRefId;
                                    // }
                                    // let hasAccess = routAccess.hasAccess(role.modulesAccess, req.route.path);
                                    // if (hasAccess) {
                                    //     // if everything is good, save to request for use in other routes
                                    //     if (req && req.decoded) {
                                    //         req.decoded = decoded;
                                    //     }
                                    //     next();
                                    // } else {
                                    //     return res.status(error.status.Forbidden).json({
                                    //         error: error.message.Forbidden,
                                    //         message: error.message.Forbidden
                                    //     });
                                    // }
                                }
                            } catch (err) {
                                return sendError(err, res, next);
                            }
                        } else {
                            // password does not match, return error in response
                            return res.status(error.status.Unauthorized).json({
                                success: false,
                                message: error.message.invalidPassword
                            });
                        }
                    }
                } catch (err) {
                    return sendError(err, res, next);
                }
            } else {
                // if there is no token
                // return an error
                return res.status(error.status.Forbidden).json({
                    error: error.message.Forbidden,
                    message: error.message.Forbidden
                });
            }
        } else {
            return res.status(error.status.Forbidden).json({
                error: error.message.Forbidden,
                message: error.message.Forbidden
            });
        }
    } else {
        return res.status(error.status.Forbidden).json({
            error: error.message.Forbidden,
            message: error.message.Forbidden
        });
    }
}

function passwordGenerator() {
    let password = '';
    let extraLength = Array(1).fill('1234').map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password = password + Array(+extraLength + 8).fill('0123456789!@#$%^&*?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password = password + Array(1).fill('0123456789').map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password = password + Array(1).fill('!@#$%^&*?').map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password = password + Array(1).fill('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password = password + Array(1).fill('abcdefghijklmnopqrstuvwxyz').map(function (x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    return password;
}