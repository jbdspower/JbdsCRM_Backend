
const mongoose = require('mongoose');
const mongodb = require("../../utills/mongodb");
const dbConfig = require('../../config/database.config');

const ToolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});


ToolSchema.statics.getAllTool = function (callback) {
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
        let categroy = conn.model("Tool", ToolSchema, "Tool");
        resolve(categroy);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.getModel = getModel;
