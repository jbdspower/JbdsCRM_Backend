const mongoose = require('mongoose');
const mongodb = require("../../utills/mongodb");
const dbConfig = require('../../config/database.config');

const CategroySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});


CategroySchema.statics.getAllCategroy = function (callback) {
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
        let categroy = conn.model("Categroy", CategroySchema, "Categroy");
        resolve(categroy);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.getModel = getModel;
