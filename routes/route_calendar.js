'use strict';
let calendarService = require('../services/calendarService');

let authCompany = require('../middleware/authCompany');
const { auth } = require('../middleware/auth');

module.exports.setRoutes = function (app) {
    app.post('/event', authCompany, auth, async (req, res) => {
        try {
            const result = await calendarService.createEvent(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/event', authCompany, auth, (req, res) => {
        calendarService.getAllEvent(req.DbName, req.user, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });
}
