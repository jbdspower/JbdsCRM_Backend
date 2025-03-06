'use strict';
let categroyProductService = require('../services/catogryProductService');
let authCompany = require('../middleware/authCompany');

module.exports.setRoutes = function (app) {

    app.post('/product', authCompany, async (req, res) => {
        try {
            const result = await categroyProductService.createProduct(req.body, req.DbName, req.Company);
            let info = { "message": "Product created Successfully" };
            return res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/product', authCompany, (req, res) => {
        categroyProductService.getAllProduct(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.patch('/product', authCompany, (req, res) => {
        categroyProductService.getAllProductByCategory(req.DbName, req.body, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });
    app.post('/categroy', authCompany, async (req, res) => {
        try {
            const result = await categroyProductService.createCategroy(req.DbName, req.body);
            let info = { message: "Categroy created Successfully" };
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/categroy', authCompany, (req, res) => {
        categroyProductService.getAllCategroy(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });
}
