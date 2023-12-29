const UserCollection = require('../../models/user');


module.exports = {
    getByUserId,
}

function getByUserId(req) {
    let promiseFunction = async (resolve, reject) => {
        let params = req.body;
        try {
            if (params.userId) {
                let userData = await UserCollection.findOne({ userId: params.userId }).lean().exec();

                resolve({ success: true, data: userData })
            } else {
                reject({ success: false, message: 'User Id not provided!' });
            }
        } catch (err) {
            reject({ success: false, message: 'Some unhandled server error has occurred', error: err });
        }
    }
    return new Promise(promiseFunction);
}