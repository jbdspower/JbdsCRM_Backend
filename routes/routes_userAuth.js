'use strict';
let userAuthService = require('../services/userAuthService');
let authCompany = require('../middleware/authCompany');

module.exports.setRoutes = function (app) {

    app.post('/login',authCompany, (req, res) => {
           console.log(req.body)
           console.log(req.DbName)
           console.log(req.body)
        userAuthService.Login(req.body, req.DbName, (err, token) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(token);

            }
        })
    });

    app.post('/forgotpassword', authCompany, (req, res) => {
        userAuthService.ForgotPassword(req.body, req.DbName, req.Company, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                let info = {
                    "message": "Password Send Successfully"
                };
                return res.status(200).send(info);

            }
        })
    });

    app.patch('/changepassword', authCompany, (req, res) => {
        userAuthService.ChangePassword(req.body, req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                let info = {
                    "message": "Password Change Successfully"
                };
                return res.status(200).send(info);

            }
        })
    });

    app.get('/checkUserIsActive/:email', authCompany, (req, res) => {
        userAuthService.checkUser(req.params.email, req.header('Authorization').replace('Bearer ', ''), req.DbName, (err, data) => {
            if (err) {
                return res.status(401).send(err);
            } else {
                return res.status(200).send(data);

            }
        })
    });

    app.get('/logout/:email', authCompany, (req, res) => {
        userAuthService.logout(req.params.email, req.header('Authorization').replace('Bearer ', ''), req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });
}