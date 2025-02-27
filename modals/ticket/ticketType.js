const mongoose = require('mongoose')
let mongodb = require('../../utills/mongodb');
const errorFunction = require('../../utills/error');

const serviceRequestType = new mongoose.Schema({
    DocumentType: {
        type: String,
        required: true,
        default: "ServiceRequestType"
    },
    RequestType: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
}, {
    timestamps: true
})


serviceRequestType.statics.createServiceRequestType = async function (data) {
    try {
        const existingCheckPointGroup = await this.findOne({ DocumentType: "ServiceRequestType", RequestType: data.RequestType });
        if (existingCheckPointGroup) {
            let error = errorFunction(' already Have', 500, 'Duplicate Error')
            throw error;
        }

        const newCheckPointGroup = new this(data);
        const result = await newCheckPointGroup.save();
        return result;
    } catch (err) {
        throw err
    }
};

serviceRequestType.statics.updateServiceRequestTypeById = function (id, updateObj, callback, session) {
    this.updateOne({ _id: id }, { $set: updateObj }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    }).session(session);
};


serviceRequestType.statics.getAllServiceRequestType = function (callback) {
    this.find({ DocumentType: "ServiceRequestType" }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};


serviceRequestType.statics.deleteServiceRequestTypeById = function (id, callback) {
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
                let user = conn.model('MoldMaintenance', serviceRequestType, "MoldMaintenance")
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;