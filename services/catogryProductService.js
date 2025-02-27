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





