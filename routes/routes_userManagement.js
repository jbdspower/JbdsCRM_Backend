'use strict';
let userService = require('../services/userManagementService');
let authCompany = require('../middleware/authCompany');

module.exports.setRoutes = function (app) {

    ////////// User Group ///////////////////
    app.post('/usergroup', authCompany, (req, res) => {
        userService.createUserGroup(req.body, req.DbName, async (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                let info = { "message": "UserGroup created Successfully" };
                return res.status(200).send(info);
            }
        });
    });

    app.patch('/usergroup/:id', authCompany, (req, res) => {
        userService.updateUserGroup(req.params.id, req.body.new, req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                return res.status(200).send(data);

            }
        })
    });

    app.delete('/usergroup/:id', authCompany, (req, res) => {
        userService.deleteUserGroup(req.params.id, req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                return res.status(200).send(data);

            }
        })
    });

    app.get('/usergroup', authCompany, (req, res) => {
        userService.getAllUserGroup(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                return res.status(200).send(data);

            }
        })
    });

    /////////////// User /////////////////
    // app.post('/user', authCompany, async (req, res) => {
    //     try {
    //         const result = await userService.createUser(req.body, req.DbName, req.Company);
    //         let info = { "message": "User created Successfully" };
    //         return res.status(200).send(info);

    //     } catch (err) {
    //         res.status(500).send(err);
    //     }
    // });
    app.post('/user',authCompany, async (req, res) => {
        try {
            const result = await userService.createUser(req.body, req.DbName, req.Company);
            console.log(result,"rrrrrrr")
            let info = { "message": "User created Successfully" };
            return res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/user', authCompany, (req, res) => {
        userService.getAllUser(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/user/:role', authCompany, (req, res) => {
        userService.getUserByRole(req.DbName,req.params, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.patch('/user/:id', authCompany, (req, res) => {
        userService.updateUser(req.params.id, req.body.new, req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                return res.status(200).send(data);

            }
        });
    });

    app.delete('/user/:id', authCompany, (req, res) => {
        userService.deleteUser(req.params.id, req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {

                return res.status(200).send(data);

            }
        });
    });

    ////////// USER ROLE /////////
    app.post('/userRole',authCompany, async (req, res) => {
        try {
            const result = await userService.createUserRole(req.DbName, req.body);
            let info = { message: "User Role created Successfully"};
            res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/userRole/:id', authCompany, (req, res) => {
        userService.updateUserRoleById(req.DbName, req.params.id, req.body, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.delete('/userRole/:id', authCompany, (req, res) => {
        userService.deleteUserRoleById(req.DbName, req.params.id, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/userRole', authCompany, (req, res) => {
        userService.getAllUserRole(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });


    ////////////// User Rights ///////////////

    // app.put('/userrights', authCompany, (req, res) => {
    //     userService.getUserRightsByQuery(req.body, req.DbName, (err, data) => {
    //         if (err) {
    //             return res.status(500).send(err);
    //         } else {
    //             return res.status(200).send(data);
    //         }
    //     });
    // });

    // app.patch('/userrights/:id', authCompany, (req, res) => {
    //     userService.updateUserRights(req.params.id, req.body.new, req.DbName, (err, data) => {
    //         if (err) {
    //             return res.status(500).send(err);
    //         } else {

    //             return res.status(200).send(data);

    //         }
    //     })
    // });

    // app.get('/userrights', authCompany, (req, res) => {
    //     userService.getAllUserRights(req.DbName, (err, data) => {
    //         if (err) {
    //             return res.status(500).send(err);
    //         } else {
    //             return res.status(200).send(data);
    //         }
    //     })
    // });

    ////////////////// Permission ///////////////////

    app.post('/permission', authCompany, async (req, res) => {
        try {
            const result = await userService.createPermission(req.body, req.DbName, req.Company);
            let info = { "message": "Permission created Successfully" };
            return res.status(200).send(info);

        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    });

    app.get('/permission', authCompany, (req, res) => {
        userService.getAllPermission(req.DbName, (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        })
    });

}
