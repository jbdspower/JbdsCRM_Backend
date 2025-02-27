'use strict';
let masterService = require('../services/masterService');
let authCompany = require('../middleware/authCompany');

module.exports.setRoutes = function (app) {

 
    app.post('/tool', authCompany, async (req, res) => {
        try {
            const result = await masterService.createTool(req.DbName, req.body);
            let info = { message: "Categroy created Successfully" };
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/tool', authCompany, (req, res) => {
        masterService.getAllTool(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.post('/manpower', authCompany, async (req, res) => {
        try {
            const result = await masterService.createManpower(req.DbName, req.body);
            let info = { message: "Categroy created Successfully" };
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/manpower', authCompany, (req, res) => {
        masterService.getAllManpower(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.post('/safetyItems', authCompany, async (req, res) => {
        try {
            const result = await masterService.createSafetyItems(req.DbName, req.body);
            let info = { message: "Categroy created Successfully" };
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/safetyItems', authCompany, (req, res) => {
        masterService.getAllSafetyItems(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.post('/customer', authCompany, async (req, res) => {
        try {
            const result = await masterService.createCustomer(req.DbName, req.body);
            let info = { message: "Customer created Successfully" };
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/customer', authCompany, (req, res) => {
        masterService.getAllCustomerList(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });


    app.get('/priority', authCompany, (req, res) => {
        masterService.getAllPriority(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/ticketMode', authCompany, (req, res) => {
        masterService.getAllTicketMode(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/companyDivision', authCompany, (req, res) => {
        masterService.getAllCompanyDivision(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });


}
