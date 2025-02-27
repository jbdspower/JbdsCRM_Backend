let user = require('../modals/userManagement/user');
let userRole = require('../modals/userManagement/userRole');
const errorFunction = require('../utills/error');
const nodeMail = require('../utills/sendMail');
let userAuthService = module.exports = {}


userAuthService.Login = function Login(data, dbName, callback) {
    user.getModel(dbName)
        .then((model) => {
            if (model) {
                return model.findByCredentials(data.email, data.password, model)
            }
            return model;
        })
        .then(async (userdoc) => {
            if (userdoc) {
                try {
                    let token = await userdoc.generateAuthToken(dbName, data.company)
                    const model=await userRole.getModel(dbName);
                    const role=await model.findOne({_id:userdoc.userRole})
                    if (token) {
                        userdoc.tokens.push({ authToken: token, notificationSubscription: null, createdAt: new Date(Date.now()) })
                        await userdoc.save();
                        callback(null, {expiresIn:1440*60,idToken:token,designation:userdoc.designation,registered:true,name:userdoc.name,email:userdoc.email,role:role.UserRole});
                        // if (userdoc.tokens.length < 2) {
                        //     userdoc.tokens.push({ authToken: token, notificationSubscription: null, createdAt: new Date(Date.now()) })
                        //     await userdoc.save();
                        //     callback(null, token);
                        // } else {
                        //     userdoc.tokens.sort((a, b) => {
                        //         return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        //     })
                        //     userdoc.tokens.splice(0, 1, { authToken: token, notificationSubscription: null, createdAt: new Date(Date.now()) })
                        //     await userdoc.save();
                        //     callback(null, token);
                        // }

                    } else {
                        let error = errorFunction('User Verification Failed', 401, 'Auth Error')
                        callback(error, null);
                    }
                }
                catch (err) {
                    callback(err, null);
                }
            }
            else {
                let error = errorFunction('Company does not exist', 401, 'Auth Error')
                callback(error, null);
            }
        })
        .catch((err) => {
            callback(err, null)
        })
}

userAuthService.ForgotPassword = function ForgotPassword(data, dbName, Company, callback) {
    let doc;
    user.getModel(dbName)
        .then((model) => {
            return model.findOne({ email: data.email })
        })
        .then(async (user) => {
            if (user) {
                doc = user;
                return await user.changePassword(null)
            }
            else {
                return null;
            }
        })
        .then((result) => {
            if (result) {
                doc.password = result;
                doc.company = Company;
                return sendMailToUser(doc)
            }
            return result;

        })
        .then((result) => {
            callback(null, result)
        })
        .catch((err) => {
            callback(err, null)
        })
}


function sendMailToUser(doc) {
    return new Promise((resolve, reject) => {
        nodeMail.SendMail(doc, (err, data) => {
            if (err) {
                reject(err)
            }
            if (data) {
                resolve(data);
            }
        })
    })
}

userAuthService.ChangePassword = function ChangePassword(data, dbName, callback) {
    user.getModel(dbName).then((model) => {
        return model.findByCredentials(data.email, data.password, model)
    })
        .then((result) => {
            return result.changePassword(data.new)
        })
        .then((result) => {
            callback(null, result)
        })
        .catch((err) => {
            callback(err, null)
        })
}

userAuthService.checkUser = function checkUser(email, token, dbName, callback) {
    //const decoded = jwt.verify(token, dbconfig.DigitalSignature)
    user.getModel(dbName)
        .then((model) => {
            if (model) {
                return model.find({ tokens: { $elemMatch: { authToken: { $eq: token } } } });
            }
            return model;
        })
        .then((result) => {
            if (result) {
                if (result.length > 0) {
                    callback(null, true)
                } else {
                    callback(null, false)
                }
            } else {
                callback(null, false)
            }
        })
        .catch((err) => {
            callback(err, null)
        })

}
userAuthService.logout = async function logout(email, token, dbName, callback) {
    user.getModel(dbName)
        .then((model) => {
            if (model) {
                return model.updateOne({ email: email }, { $pull: { tokens: { authToken: token } } });
            }
            return model;
        })
        .then((result) => {
            if (result) {
                callback(null, true)
            } else {
                callback(null, false)
            }
        })
        .catch((err) => {
            callback(err, null)
        })

}
