let mongoose = require('mongoose');
let mongodb = require('../../utills/mongodb')

const userRoleSchema = new mongoose.Schema({
    UserRole: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
}, {
    timestamps: true
});



// userRoleSchema.statics.createUserRole = async function (data) {
//     try {
//         let modelService = new this(data);
//         const result = await modelService.save({});
//         return result;
//     } catch (err) {
//         throw err;
//     }
// };

// userRoleSchema.statics.updateUserRoleById = function (id, updateObj, callback, session) {
//     this.updateOne({ _id: id }, { $set: updateObj }, function (err, data) {
//         if (err) {
//             return callback(err, null);
//         }
//         return callback(null, data);
//     }).session(session);
// };


userRoleSchema.statics.getAllUserRole = function (callback) {
    this.find({}, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};


userRoleSchema.statics.deleteUserRoleById = function (id, callback) {
    this.deleteOne({ '_id': id }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};


function getModel(db) {
    return new Promise((resolve, reject) => {
        mongodb.getDataBaseConnection(db)
            .then((conn) => {
                let userRole = conn.model('UserRole', userRoleSchema, "UserRole")
                resolve(userRole);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;