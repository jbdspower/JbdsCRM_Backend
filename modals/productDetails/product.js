const mongoose = require('mongoose');
const mongodb = require("../../utills/mongodb");
const dbConfig = require('../../config/database.config');
// const categroy = require('./categroy');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  categroy: { type: mongoose.Schema.Types.ObjectId, ref: 'Categroy', required: true },
});

ProductSchema.statics.getAllProduct = function (callback) {
  this.find({})
    .populate({ path: 'categroy', select: 'name' }).lean()
    .exec(function (err, products) {
      if (err) {
        return callback(err, null);
      }
      products.forEach((x) => {
        x.categroy = x.categroy.name
      })
      return callback(null, products);
    });
};

ProductSchema.statics.getAllProductByCategory = function (Category = [], callback) {
  this.find({ categroy: { $in: Category } }) // Corrected 'categroy' to 'category'
    .populate('categroy') // Populate the 'category' field
    .exec(function (err, products) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, products);
    });
};


function getModel(db) {
  return new Promise((resolve, reject) => {
    mongodb
      .getDataBaseConnection(db)
      .then((conn) => {
        let product = conn.model("Product", ProductSchema, "Product");
        resolve(product);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports.getModel = getModel;
