
const mongoose = require('mongoose');
const mongodb = require("../../utills/mongodb");
const dbConfig = require('../../config/database.config');

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, require: true },
    designation: { type: String },
    department: { type: String },
    plant: { type: String }
});


CustomerSchema.statics.getAllCustomerList = function (callback) {
    this.find({}, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};

function getModel(db) {
    return new Promise((resolve, reject) => {
        mongodb
            .getDataBaseConnection(db)
            .then((conn) => {
                let categroy = conn.model("Customer", CustomerSchema, "Customer");
                resolve(categroy);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports.getModel = getModel;
