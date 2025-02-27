'use strict';
let leadService = require('../services/leadService');
let authCompany = require('../middleware/authCompany');

module.exports.setRoutes = function (app) {


    app.post('/createLead', authCompany, async (req, res) => {
        try {
            const result = await leadService.createLead(req.DbName, req.body);
            res.status(200).send(result);
        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/updateLead', authCompany, async (req, res) => {
        try {
            const result = await leadService.updateLead(req.DbName, req.body);
            res.status(200).send(result);
        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/getAllLead', authCompany, async (req, res) => {
        leadService.getAllLeads(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/getLastLeadId', authCompany, async (req, res) => {
        leadService.getLastLead(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

}
