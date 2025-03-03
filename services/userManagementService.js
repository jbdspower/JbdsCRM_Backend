const crypto = require('crypto');
const user = require('../modals/userManagement/user');
const userRole = require('../modals/userManagement/userRole');
const permission = require('../modals/userManagement/permission');
const UserService = module.exports = {}


UserService.createUser = async function createUser(data, dbName, CompanyName) {
    try {
       // data.password = crypto.randomBytes(2).toString('hex');
        let userModel = await user.getModel(dbName);
        data.active=true
        const model = new userModel(data)
        await model.save()
        return 'User created successfully.';

    } catch (err) {
        throw err;
    }
}

UserService.getAllUser = function getAllUser(dbName, callback) {
    user.getModel(dbName).then((model) => {
        model.getAllUser((err, data) => {
            console.log(err,data);
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    }).catch((err) => {
        callback(err, null)
    });
};

UserService.getUserByRole = function getUserByRole(dbName,params, callback) {
    user.getModel(dbName).then((model) => {
        model.getUserByRole(params.role,(err, data) => {
            console.log(err,data);
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    }).catch((err) => {
        callback(err, null)
    });
};

UserService.deleteUser = function deleteUser(id, dbName, callback) {
    user.getModel(dbName).then((model) => {
        model.deleteUserById(id, dbName, (err, data) => {
            if (err) {
                let error = errorFunction(err, 500, 'In Use')
                return callback(error, null);
            } else {
                return callback(null, data);
            }
        })
    }).catch((err) => {
        callback(err, null);
    })
};


UserService.createUserRole = async function createUserRole(dbName, data) {
    try {
        let usersRole = await userRole.getModel(dbName);
         const model = new usersRole(data)
        await model.save()
        return 'UserRole created successfully.';

    } catch (err) {
        if (err.code === 11000) {
            let error = errorFunction('User Role already Have', 409, 'Duplicate Error')
            throw error;
        }
        throw err;
    }
};

UserService.getAllUserRole = function getAllUserRole(dbName, callback) {
    userRole.getModel(dbName).then((model) => {
            model.getAllUserRole((err, data) => {
                if (err) {
                    return callback(err, null);
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            callback(err, null);
        })
};

UserService.createPermission = async function createPermission(data, dbName, CompanyName) {
    try {
        data.password = crypto.randomBytes(2).toString('hex');
        let permissionModel = await permission.getModel(dbName);
        const model = new permissionModel(data)
        await model.save()
        return 'Permission created successfully.';

    } catch (err) {
        throw err;
    }
}

UserService.getAllPermission = function getAllPermission(dbName, callback) {
    permission.getModel(dbName).then((model) => {
            model.getAllPermission((err, data) => {
                if (err) {
                    console.log("IN",err);
                    return callback(err, null);
                } else {
                    return callback(null, data);
                }
            })
        })
        .catch((err) => {
            console.log("Catch",err);
            callback(err, null);
        })
};





