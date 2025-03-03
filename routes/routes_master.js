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


    //=============================rohitnewpoint==============================
    app.patch('/manpower/:id', authCompany, async (req, res) => {
        try {
            const manpowerId = req.params.id; // Get manpower ID from URL
            const updateData = req.body; // Get the updated fields from request body
    
            const updatedManpower = await masterService.updateManpower(req.DbName, manpowerId, updateData);
            
            res.status(200).send({
                success: true,
                message: 'Manpower updated successfully',
                data: updatedManpower
            });
    
        } catch (err) {
            res.status(err.statusCode || 500).send({
                success: false,
                message: err.message || 'Error updating manpower',
                error: err
            });
        }
    });
    




    //===========================rohitnewpoint===============================

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


    // ===============================newpoint update safetyItems
    app.patch('/safetyItems/:id', authCompany, async (req, res) => {
        try {
            const safetyItemsId = req.params.id; // Get manpower ID from URL
            const updateData = req.body; // Get the updated fields from request body
    
            const updatedSafetyItems = await masterService.updateSafetyItems(req.DbName, safetyItemsId, updateData);
            
            res.status(200).send({
                success: true,
                message: 'SafetyItems updated successfully',
                data: updatedSafetyItems
            });
    
        } catch (err) {
            res.status(err.statusCode || 500).send({
                success: false,
                message: err.message || 'Error updating SafetyItems',
                error: err
            });
        }
    });





    app.delete('/safetyItems/:id', authCompany, async (req, res) => {
        try {
            const safetyItemsId = req.params.id; // Get customer ID from URL
    
            await masterService.deleteSafetyItems(req.DbName, safetyItemsId);
    
           return res.status(200).send({
                success: true,
                message: 'SafetyItems deleted successfully'
            });
    
        } catch (err) {
          return  res.status(err.statusCode || 500).send({
                success: false,
                message: err.message || 'Error deleting safetyItems',
                error: err
            });
        }
    });
      //====================================newpoint update safetyItems

    app.post('/customer', async (req, res) => {
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

    //=======================rohit new point customer update===============================
    app.patch('/customer/:id', authCompany, async (req, res) => {
        try {
            const customerId = req.params.id; // Get manpower ID from URL
            const updateData = req.body; // Get the updated fields from request body
    
            const updatedCustomer = await masterService.updatedCustomer(req.DbName, customerId, updateData);
            
            res.status(200).send({
                success: true,
                message: 'Customer updated successfully',
                data: updatedCustomer
            });
    
        } catch (err) {
            res.status(err.statusCode || 500).send({
                success: false,
                message: err.message || 'Error updating customer',
                error: err
            });
        }
    });



    app.delete('/customer/:id', authCompany, async (req, res) => {
        try {
            const customerId = req.params.id; // Get customer ID from URL
             await masterService.deleteCustomer(req.DbName, customerId);
    
            res.status(200).send({
                success: true,
                message: 'Customer deleted successfully'
            });
             } catch (err) {
            res.status(err.statusCode || 500).send({
                success: false,
                message: err.message || 'Error deleting customer',
                error: err
            });
        }
    });
 //===========================rohitnewpoint===============================

   



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
