'use strict';
let reportingService = require('../services/reportingService');
let authCompany = require('../middleware/authCompany');
const { auth } = require('../middleware/auth');

module.exports.setRoutes = function (app) {

    app.post('/GetDashboardData', authCompany, auth, async (req, res) => {
        try {
            const result = await reportingService.GetDashboardData(req.body, req.DbName, req.Company, req.user);
            return res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });



}