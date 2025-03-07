// const crypto = require('crypto');
const categroy = require('../modals/productDetails/categroy');
const product = require('../modals/productDetails/product');
const CategoryProductService = module.exports = {}


CategoryProductService.createProduct = async function createProduct(data, dbName) {
    try {
        // data.password = crypto.randomBytes(2).toString('hex');
        let productModel = await product.getModel(dbName);
        const model = new productModel(data)
        await model.save()
        return 'Product created successfully.';

    } catch (err) {
        throw err;
    }
}

CategoryProductService.getAllProduct = function getAllProduct(dbName, callback) {
    product.getModel(dbName).then((model) => {
        model.getAllProduct((err, data) => {
            console.log(err, data);
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

CategoryProductService.getAllProductByCategory = function getAllProductByCategory(dbName, params, callback) {
    product.getModel(dbName)
    .then(async (model) => {
        const catModal=await categroy.getModel(dbName)
        params.Category=await catModal.find({name:{$in:params.Category}}).lean();
        params.Category=params.Category.map(x=>x._id)
        model.getAllProductByCategory(params.Category, (err, data) => {
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
//========================updatenew point======================================
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion

CategoryProductService.updateProductDetails = function updateProductDetails(dbName, productId, params, callback) {
    product.getModel(dbName)
        .then(async (model) => {
            try {
                console.log("Received Params:", params);

                // Ensure productId is a valid ObjectId
                if (!mongoose.Types.ObjectId.isValid(productId)) {
                    console.log("Error: Invalid Product ID:", productId);
                    return callback(null, { message: "Invalid Product ID" });
                }

                // Remove 'Category' from params if present (so it doesn't get updated)
                if (params.Category) {
                    console.log("Skipping Category update, updating only product details.");
                    delete params.Category;
                }

                // Update only provided product details
                model.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(productId) }, // Convert productId to ObjectId
                    { $set: params }, // Only update the provided fields
                    { new: true } // Return the updated document
                )
                .lean()
                .exec((err, updatedProduct) => {
                    if (err) {
                        console.error("Database Error in updateProductDetails:", err);
                        return callback(err, null);
                    } else if (!updatedProduct) {
                        console.log("No product found for ID:", productId);
                        return callback(null, { message: "Product not found" });
                    } else {
                        console.log("Updated Product Details:", updatedProduct);
                        return callback(null, updatedProduct);
                    }
                });

            } catch (error) {
                console.error("Error in updateProductDetails:", error);
                return callback(error, null);
            }
        })
        .catch((err) => {
            console.error("Error fetching product model:", err);
            callback(err, null);
        });
};




//========================updatenew point======================================

CategoryProductService.createCategroy = async function createCategroy(dbName, data) {
    try {
        let categroys = await categroy.getModel(dbName);
        const model = new categroys(data)
        await model.save()
        console.log(data);

        return 'Category created successfully.';

    } catch (err) {
        if (err.code === 11000) {
            let error = errorFunction('Category already Have', 409, 'Duplicate Error')
            throw error;
        }
        throw err;
    }
};

CategoryProductService.getAllCategroy = function getAllCategroy(dbName, callback) {
    categroy.getModel(dbName).then((model) => {
        model.getAllCategroy((err, data) => {
            console.log("AAAAAAAAAAAAAA", err, data);
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





