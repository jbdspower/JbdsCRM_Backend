
const mongoose = require('mongoose');
const mongodb = require("../../utills/mongodb");
const dbConfig = require('../../config/database.config');

const ManpowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});


ManpowerSchema.statics.getAllManpower = function (callback) {
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
        let categroy = conn.model("Manpower", ManpowerSchema, "Manpower");
        resolve(categroy);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.getModel = getModel;
