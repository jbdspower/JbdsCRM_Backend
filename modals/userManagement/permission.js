let mongoose = require('mongoose');
let mongodb = require('../../utills/mongodb')

const permissionSchema = new mongoose.Schema({
    permission: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
}, {
    timestamps: true
});

permissionSchema.statics.getAllPermission = function (callback) {
    this.find({}).exec(function (err, permission) {
        if (err) {
            return callback(err, null)
        }
        return callback(null, permission)
    });
};

function getModel(db) {
    return new Promise((resolve, reject) => {
        mongodb.getDataBaseConnection(db)
            .then((conn) => {
                let permission = conn.model('Permission', permissionSchema, "Permission")
                resolve(permission);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;