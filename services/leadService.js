const crypto = require('crypto');
const user = require('../modals/userManagement/user');
const userRole = require('../modals/userManagement/userRole');
const lead = require('../modals/lead/lead');
const leadService = module.exports = {}


leadService.createLead = async function createLead(dbName, data) {
    try {
        let leadModel = await lead.getModel(dbName);
        const res = await leadModel.createLead(data);
        return res;

    } catch (err) {
        throw err;
    }
}

leadService.updateLead = async function updateLead(dbName, data) {
    try {
        let leadModel = await lead.getModel(dbName);
        const res = await leadModel.updateOne({ _id: data._id }, { $set: data });
        return res;

    } catch (err) {
        throw err;
    }
}

leadService.getAllLeads = function getAllLeads(dbName, callback) {
    lead.getModel(dbName)
        .then((model) => {
            model.getAllLeads("createdAt", -1, (err, data) => {
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

leadService.getLastLead = function getLastLead(dbName, callback) {
    generateServiceRequestID(dbName)
        .then((id) => {
            callback(null, id)
        }).catch((err) => {
            callback(err, null)
        });
};


async function generateServiceRequestID(dbName) {
    try {
        let dateTime = require('date-and-time');
        let todaysDate = dateTime.format(new Date(Date.now()), 'YYMMDD');

        const modal = await lead.getModel(dbName);
        let dbResult = await modal.find({ Id: new RegExp(`^JPL-${todaysDate}-`) }).sort({ Id: -1 }).limit(1).lean();
        let newServiceRequestID;
        if (dbResult.length > 0) {
            let lastServiceRequestID = dbResult[0].Id;
            lastServiceRequestID = lastServiceRequestID.split('-')
            let lastNumber = parseInt(lastServiceRequestID[lastServiceRequestID.length - 1]);
            let nextNumber = lastNumber + 1;
            let paddedNumber = nextNumber.toString().padStart(4, '0');
            newServiceRequestID = `JPL-${todaysDate}-${paddedNumber}`;
        }
        else {
            newServiceRequestID = `JPL-${todaysDate}-0001`;
        }
        return newServiceRequestID;

    } catch (err) {
        throw err;
    }
}









