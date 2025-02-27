const manpowerModal = require('../modals/master/manpower');
const toolModal = require('../modals/master/toolMaster');
const safetyItemsModel = require('../modals/master/safetyitems')
const customerModel = require('../modals/master/customer')
const priority=require('../modals/master/priority');
const ticketMode=require('../modals/master/ticketMode')
const companyDivision=require('../modals/master/companyDivision')

const MasterService = module.exports = {}

MasterService.createTool = async function createTool(dbName, data) {
    try {
        const tool = await toolModal.getModel(dbName);
        const model = new tool(data)
        await model.save()

        return 'Category created successfully.';

    } catch (err) {
        if (err.code === 11000) {
            let error = errorFunction('Category already Have', 409, 'Duplicate Error')
            throw error;
        }
        throw err;
    }
};

MasterService.getAllTool = function getAllTool(dbName, callback) {
    toolModal.getModel(dbName).then((model) => {
        model.getAllTool((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};

MasterService.createManpower = async function createManpower(dbName, data) {
    try {
        const manpower = await manpowerModal.getModel(dbName);
        const model = new manpower(data)
        await model.save()
        return 'Category created successfully.';

    } catch (err) {
        if (err.code === 11000) {
            let error = errorFunction('Manpower already Have', 409, 'Duplicate Error')
            throw error;
        }
        throw err;
    }
};

MasterService.getAllManpower = function getAllManpower(dbName, callback) {
    manpowerModal.getModel(dbName).then((model) => {
        model.getAllManpower((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};

MasterService.createSafetyItems = async function createSafetyItems(dbName, data) {
    try {
        const safetyitems = await safetyItemsModel.getModel(dbName);
        const model = new safetyitems(data)
        await model.save()
        return 'Category created successfully.';

    } catch (err) {
        if (err.code === 11000) {
            let error = errorFunction('Manpower already Have', 409, 'Duplicate Error')
            throw error;
        }
        throw err;
    }
};

MasterService.getAllSafetyItems = function getAllSafetyItems(dbName, callback) {
    safetyItemsModel.getModel(dbName).then((model) => {
        model.getAllSafetyItems((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};


MasterService.getAllPriority = function getAllPriority(dbName, callback) {
    priority.getModel(dbName).then((model) => {
        model.getAllPriority((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};

MasterService.getAllTicketMode = function getAllTicketMode(dbName, callback) {
    ticketMode.getModel(dbName).then((model) => {
        model.getAllTicketMode((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};

MasterService.getAllCompanyDivision = function getAllCompanyDivision(dbName, callback) {
    companyDivision.getModel(dbName).then((model) => {
        model.getAllCompanyDivision((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};


MasterService.createCustomer = async function createCustomer(dbName, data) {
    try {
        const safetyitems = await customerModel.getModel(dbName);
        const model = new safetyitems(data)
        await model.save()
        return 'Customer created successfully.';

    } catch (err) {
        if (err.code === 11000) {
            let error = errorFunction('Customer already Have', 409, 'Duplicate Error')
            throw error;
        }
        throw err;
    }
};

MasterService.getAllCustomerList = function getAllCustomerList(dbName, callback) {
    customerModel.getModel(dbName).then((model) => {
        model.getAllCustomerList((err, data) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, data);
            }
        })
    })
        .catch((err) => {
            callback(err, null);
        })
};