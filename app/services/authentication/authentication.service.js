const UserCollection = require('../../models/user');
const RoleCollection = require('../../models/roles');
const AuthToken = require('../../models/authToken.model');
const PermissionCollection = require('../../models/permissions');
const helper = require('../../middleware/utils');
const helpers = require('../../utility');
const { generateToken } = require('../../controllers/auth/helpers/generateToken');

module.exports = {
    authenticate,
    register,
    forgotUserPassword
}

const passwordPattern = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^*+=]).{8,}$/);

function authenticate(req) {
    let promiseFunction = async (resolve, reject) => {
        // get authentication credentials from request
        let params = req.body;
        // check if authorization header is present or not in request
        if (req.headers.authorization) {
            // get autorization header
            let athorizationToken = req.headers.authorization.split(' ')[1];

            // Check whether params have key grant_type or not
            if (params.grantType == 'password') {
                // if yes, then it will verify email and password
                // and then give access and refresh token

                // get values from authorization header
                let buf = new Buffer.from(athorizationToken, 'base64');
                let loginCredentials = {};
                loginCredentials.email = buf.toString().split(':')[0];
                loginCredentials.password = buf.toString().split(':')[1];
                try {
                    let access = await getAuthentication(loginCredentials.email, loginCredentials.password, req.headers['user-agent'])
                    return resolve(access);
                } catch (e) {
                    return reject(e);
                }
            } else if (params.grantType == 'accessToken') {
                // grant type is found accesstoken
                // it will verify refresh token
                // and then generate new access token

                // find token which has the refresh token same as refresh token got from request
                try {
                    let token = await AuthToken.findOne({ refreshToken: athorizationToken }).exec();
                    token.accessToken = token.accessToken;
                    token.refreshToken = token.refreshToken;
                    await token.save();
                } catch (err) {
                    reject({ success: false, message: '50-Some unhandled server error has occurred', error: err });
                }
            } else {
                // grant type not found, return error in response
                reject({
                    success: false,
                    status: 401,
                    message: 'Not found valid grantType.'
                });
            }
        } else {
            // authorization header not found, return error in response
            reject({ success: false, message: 'No Authorization header is provided' });
        }
    }
    return new Promise(promiseFunction);
}

function getAuthentication(email, password, userAgent, token) {
    let promiseFunction = async (resolve, reject) => {
        try {
            let user = null;
            try {
                // Mongoose Update
                user = await UserCollection.findOne({
                    email: email
                }).lean().exec();
            } catch (e) {
                return reject({ success: false, message: '78-Some unhandled server error has occurred', error: e });
            }
            if (!user) {
                // if no user found based on email,
                // then it will return error in response
                return reject({ success: false, message: 'You have entered invalid email address and/or password.' });
            }
            let role = await RoleCollection.findById(user.role).lean().exec();
            if (role) {
                user['role'] = role;
            }
            if (password) {
                //Check if password matches
                let compare = user.password === password;
                if (!compare) {
                    if (user.invalidLoginAttempts === 2) {
                        try {
                            // await helper.util.sendNewPasswordEmail(user.email);
                            return resolve({
                                success: false,
                                status: 401,
                                message: 'If the email address entered is valid, new password will be sent to it.'
                            });
                        } catch (e) {
                            console.error(e)
                            return reject({
                                success: false,
                                status: 401,
                                message: 'You have entered invalid email address and/or password.'
                            });
                        }
                    } else {
                        if (user.invalidLoginAttempts >= 3) {
                            let mailParams = {
                                contactEmail: process && process.env && process.env.EMAIL_ACC ? process.env.EMAIL_ACC : helper.mail.mailId.support,
                                from: helper.mail.mailId.notification,
                                email: user.email,
                                subject: `QuestionQraft Alert : Too many invalid login attepmt`,
                                userName: user.firstname + ' ' + user.lastname,
                                mailBody: ''
                            };
                            mailParams.mailBody = `<p>We noticed that there were multiple attempts to login into the QuestionQraft Portal associated with your user id.
                        We have sent you a separate email with a new password. If you did not attempt login, please <a href="mailto:${mailParams.contactEmail}"><u>contact us</u></a> immediately.</p>`;
                            try {
                                // helper.mail.sendMail(helper.mail.template.general, mailParams);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                        helper.util.updateUserFailLoginAttempt(user._id);
                        return resolve({
                            success: false,
                            status: 401,
                            message: 'You have entered invalid email address and/or password.'
                        });
                    }
                }
                //Password matched
                // if (helper.util.isPasswordExpired(user.lastPasswordUpdatedAt)) {
                //     user.isPasswordChanged = false;
                // }

                // Update fail login attempt to 0
                user.invalidLoginAttempts = 0;
                user.lastPasswordUpdatedAt = (!user.lastPasswordUpdatedAt) ? new Date().getTime() : user.lastPasswordUpdatedAt;
                try {
                    await UserCollection.findOneAndUpdate({ email: email }, user).exec();
                    // await user.save();
                    console.info(new Date(), 'lastPasswordUpdatedAt saved : ', user.lastPasswordUpdatedAt);
                } catch (err) {
                    console.error(new Date(), 'lastPasswordUpdatedAt not saved : ', err);
                }
                let result = await generatedAuthentication(user, userAgent, token);
                return resolve(result);
            } else {
                if (user.toJSON) {
                    user = user.toJSON();
                }
                let result = await generatedAuthentication(user, userAgent, token);
                return resolve(result);
            }
        } catch (e) {
            return reject({ success: false, message: '244-Some unhandled server error has occurred', error: e });
        }
    };
    return new Promise(promiseFunction);
}

function generatedAuthentication(user, userAgent, token) {
    let promiseFunction = async (resolve, reject) => {
        if (!user.role || !user.role.roleName) {
            reject({ success: false, message: 'Unable to find your role.' });
        } else {
        // create an access token
            let userWithToken = generateToken(user);
            let newAuthToken = new AuthToken({
                accessToken: userWithToken,
                // refreshToken: userWithToken,
                lastActivityAt: new Date(),
                userId: user.userId,
                idp: token && token.idp ? token.idp : null,
                nameID: token && token.email ? token.email : null,
                sessionIndex: token && token.sessionIndex ? token.sessionIndex : null,
                role: user.role.roleName,
                userAgent: userAgent
            });
            try {
                let authToken = await newAuthToken.save();
                let permission = await PermissionCollection.findOne({}).lean().exec();
                resolve({ success: true, user: user, auth: authToken, permission: permission });
            } catch (err) {
                reject({ success: false, message: '289-Some unhandled server error has occurred.', error: err });
            }
        }
    }
    return new Promise(promiseFunction);
}

function register(criteria) {
    let promiseFunction = async (resolve, reject) => {
        if (!criteria.firstname || criteria.firstname === null || criteria.firstname === '' ||
            !criteria.lastname || criteria.lastname === null || criteria.lastname === '' ||
            // !criteria.password || criteria.password === null || criteria.password === '' ||
            !criteria.email || criteria.email === null || criteria.email === '' ||
            !criteria.role || criteria.role === null || criteria.role === '') {
            reject({
                success: false,
                msg: 'Ensure username, email, password and role were provided'
            });
        } else {
            // if (!passwordPattern.test(criteria.password)) {
            //     return reject({ success: false, message: helper.error.message.passwordRequiredPatternFailed });
            // }
            let newUser = new UserCollection({
                firstname: criteria.firstname,
                lastname: criteria.lastname,
                email: criteria.email,
                // password: criteria.password,
                role: criteria.role,
                lastPasswordUpdatedAt: new Date().getTime(),
                //TODO: Add logic for temporarytoken to be sent via email for email confirmation
                //temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail
            });
            try {
                let role = await RoleCollection.findById(criteria.role).lean().exec();
                if (!role) {
                    reject({ success: false, message: 'No such provided role found for user.' });
                } else {
                    newUser.userId = await helper.generateCounterId('userProfiles', 'userId', 'QQU');
                    try {
                        let randomPass = helpers.util.passwordGenerator();
                        newUser['password'] = randomPass;
                        await newUser.save();
                        resolve({ success: true, message: 'Account registered' }); // Send success message back to controller/request        
                        let mailParams = {
                            from: helpers.mail.mailId.support,
                            email: newUser.email,
                            subject: helpers.mail.subject.registration,
                            userName: newUser.firstname,
                            newpass: randomPass
                        };
                        helpers.mail.sendMail(helpers.mail.template.registration, mailParams,
                            function () {
                                console.info(new Date(), 'password : Success in sending mail');
                            },
                            function () {
                                console.warn(new Date(), 'password : Failure in sending mail');
                            }
                        );
                    } catch (err) {
                        // Check if any validation errors exists (from user model)
                        if (err.errors && err.errors !== null) {
                            if (err.errors.email) {
                                reject({ success: false, message: err.errors.email.message }); // Display error in validation (email)
                            } else if (err.errors.password) {
                                reject({ success: false, message: err.errors.password.message }); // Display error in validation (password)
                            } else {
                                reject({ success: false, message: err }); // Display any other errors with validation
                            }
                        } else {
                            // Check if duplication error exists
                            if (err.code == 11000) {
                                if (err.errmsg[63] == 'e') {
                                    reject({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                                } else {
                                    reject({ success: false, message: err }); // Display any other error    
                                }
                            } else {
                                reject({ success: false, message: err }); // Display any other error
                            }
                        }
                    }
                }
            } catch (err) {
                reject({ success: false, message: '353-Some unhandled server error has occurred', error: err });
            }
        }
    }
    return new Promise(promiseFunction);
}

function forgotUserPassword(email){
    let promiseFunction = async (resolve, reject) => {
        if (email) {
            let randomPass = helpers.util.passwordGenerator();
            let update = {
                isPasswordChanged: false,
                lastPasswordUpdatedAt: new Date().getTime(),
                password: randomPass
            }

            try{
                let updatedUser = await UserCollection.findOneAndUpdate({ email: email }, update).exec();
                if (updatedUser){
                    let mailParams = {
                        from: helpers.mail.mailId.support,
                        email: updatedUser.email,
                        subject: helpers.mail.subject.forgotPassword,
                        userName: updatedUser.firstname + " " + updatedUser.lastname,
                        newpass: randomPass
                    }

                    helpers.mail.sendMail(helpers.mail.template.forgotPassword, mailParams,
                        function () {
                            console.info(new Date(), 'Forgot Password: Success in sending mail!');
                        },
                        function () {
                            console.error(new Date(), 'Forgot Password: Failure in sending mail')
                        });

                    resolve({ success: true, message: 'If the email entered is valid, new password will be sent to it.' });
                } else {
                    reject({ success: false, message: 'If the email entered is valid, new password will be sent to it.' });
                }
            } catch(e) {
                console.log(new Date(), e);
                reject({ success: false, message: 'If the email entered is valid, new password will be sent to it.' });
            }
        } else {
            reject({ success: false, message: 'Email is required!' });
        }
    }
    return new Promise(promiseFunction);
}