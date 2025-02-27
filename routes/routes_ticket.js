'use strict';
let serviceRequestService = require('../services/ticketService');
let authCompany = require('../middleware/authCompany');
const testupload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');


module.exports.setRoutes = function (app) {

    //////////// serviceRequestType ///////////////
    app.post('/serviceRequestType', authCompany, async (req, res) => {
        try {
            const result = await serviceRequestService.createServiceRequestType(req.DbName, req.body);
            let info = {
                "message": "Service Request Type created Successfully"
            };
            res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/serviceRequestType/:id', authCompany, (req, res) => {
        serviceRequestService.updateServiceRequestTypeById(req.DbName, req.params.id, req.body, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.delete('/serviceRequestType/:id', authCompany, (req, res) => {
        serviceRequestService.deleteServiceRequestTypeById(req.DbName, req.params.id, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/serviceRequestType', authCompany, (req, res) => {
        serviceRequestService.getAllServiceRequestType(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });






    //////////// Service Request State Type ///////////////
    app.post('/serviceRequestStateType', authCompany, async (req, res) => {
        try {
            const result = await serviceRequestService.createServiceRequestStateType(req.DbName, req.body);
            let info = {
                "message": "Service Request State Type created Successfully"
            };
            res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    //////////// Work Flow ///////////////
    app.post('/workFlow', authCompany, async (req, res) => {
        try {
            const result = await serviceRequestService.createWorkFlow(req.DbName, req.body);
            let info = {
                "message": "Work Flow created Successfully"
            };
            res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/workFlow/:id', authCompany, (req, res) => {
        serviceRequestService.updateWorkFlowById(req.DbName, req.params.id, req.body, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.delete('/workFlow/:id', authCompany, (req, res) => {
        serviceRequestService.deleteWorkFlowById(req.DbName, req.params.id, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.get('/workFlow', authCompany, (req, res) => {
        serviceRequestService.getAllWorkFlow(req.DbName, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });
    //////////// Ticket Comment  ////////////////

    app.get('/ticketData/:id', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.getTicketHistory(req.DbName, req.params);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.post('/ticketComment', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.createComment(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/updateDueDate', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.updateDueDate(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/updateTicketAssignee', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.updateTicketAssignee(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/ReOpenTicket', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.ReOpenTicket(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/changeParams', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.changeParams(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.put('/ticketComment', authCompany, auth, async (req, res) => {
        try {
            const result = await serviceRequestService.getCommentByQuery(req.DbName, req.body, req.user);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });
    //////////// serviceRequest Master ////////////////
    app.post('/serviceRequest', authCompany, async (req, res) => {
        try {
            const result = await serviceRequestService.createServiceRequest(req.DbName, req.body, req.id);
            let info = {
                "message": "Service Request created Successfully"
            };
            res.status(200).send(info);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.patch('/serviceRequest/:id', authCompany, (req, res) => {
        serviceRequestService.updateServiceRequestById(req.DbName, req.params.id, req.body.new, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });

    app.delete('/serviceRequest/:id', authCompany, (req, res) => {
        serviceRequestService.deleteServiceRequestById(req.DbName, req.params.id, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).send(data);
            }
        });
    });


    app.get('/serviceRequest', authCompany, async (req, res) => {
        try {
            const result = await serviceRequestService.getAllServiceRequest(req.DbName);
            res.status(200).send(result);

        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.put('/serviceRequest', authCompany, auth, async (req, res) => {
        try {
            const data = await serviceRequestService.getServiceRequestFromToTill(req.DbName, req.body);
            res.status(200).send(data);

        } catch (error) {
            res.status(500).send(error);
        }
    });

    app.put('/serviceRequestStateLogs', authCompany, auth, async (req, res) => {
        try {
            const data = await serviceRequestService.getServiceRequestStateLogs(req.DbName, req.body);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send(err);
        }
    });


    ////////// States WorkFlow //////////
    app.put('/nextState', authCompany, auth, async (req, res) => {
        try {
            const data = await serviceRequestService.getNextServiceRequestState(req.user, req.DbName, req.body);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send(err);
        }
    });

    app.get('/files', (req, res) => {
        const directoryPath = path.join(__dirname, '../uploads');
        res.setHeader('Content-Type', 'image/png');
        res.sendFile(directoryPath);
    });

    app.put('/serviceRequestState', authCompany, testupload, auth, async (req, res) => {
        try {
            const formData = JSON.parse(req.body.Data)
            formData.Data.Files = req.body.Files
            const data = await serviceRequestService.changeServiceRequestState(req.user, req.DbName, formData);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    app.put('/ticketCustomData', authCompany, testupload, auth, async (req, res) => {
        try {
            const formData = JSON.parse(req.body.Data)
            formData.Files = req.body.Files
            const data = await serviceRequestService.ticketUpdateCustomData(req.user, req.DbName, formData);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    app.get('/GetAllTicket', authCompany, auth, async (req, res) => {
        try {
            const data = await serviceRequestService.GetAllTicket(req.user, req.DbName);
            res.status(200).send(data);
        } catch (err) {
            res.status(500).send(err);
        }
    });
}