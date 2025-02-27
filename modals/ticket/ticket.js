const mongoose = require('mongoose')
let mongodb = require('../../utills/mongodb');

const serviceRequestSchema = new mongoose.Schema({
    DocumentType: {
        type: String,
        required: true,
        default: "ServiceRequest"
    },
    SR_ID: {
        type: String,
        required: true,
    },
    Status: { type: String, enum:["Active","On Hold"] },
    Priority: { type: String, enum: ["High", "Low", "Medium"] },
    CustomerOTP: {
        type: String,
        default: null
    },
    StartDate: {
        type: Date,
        required: true
    },
    DueDate: {
        type: Date,
        default: null
    },
    RequestType: {
        type: String,
    },
    Description: {
        type: String,
        trim: true,
        lowercase: true,
    },
    StateType: {
        type: String,
        required: true,
    },
    StateName: {
        type: String,
        required: true,
    },
    CreatedBy: {
        type: String,
        // required: true,
        // ref: 'USER',
        default: null
    },
    WorkFlowId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'MoldMaintenance',
    },
    CustomData: { type: mongoose.Schema.Types.Mixed },
    SR_Data_Logs: [{
        EventLogs: [{ type: Object }],
        FieldData: { type: Object },
        CreatedBy: { type: String },
        CreatedAt: { type: Date, default: new Date() },
        StateType: { type: String, trim: true },
        StateName: { type: String, trim: true },
        Control_Name: { type: String, trim: true },
        Action: { type: String, trim: true },
        NextStateName: { type: String, trim: true },
        UpdateData: [{ type: mongoose.Schema.Types.Mixed }],
    }],
}, {
    timestamps: true
})


serviceRequestSchema.statics.createServiceRequest = async function (data) {
    try {
        const newCheckPointGroup = new this(data);
        const result = await newCheckPointGroup.save();
        return result;
    } catch (err) {
        throw err
    }
};

serviceRequestSchema.statics.updateServiceRequestById = function (id, updateObj, callback, session) {
    this.updateOne({ _id: id }, { $set: updateObj }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    }).session(session);
};


serviceRequestSchema.statics.getServiceRequestFromToTill = async function (From, Till, skipCount, PageSize) {
    try {
        let data = await this.find
            ({
                DocumentType: "ServiceRequest", createdAt: { $gte: From, $lte: Till }
            })
            .sort({ createdAt: -1 })
            .skip(skipCount)
            .limit(PageSize)
            .populate({
                path: 'RequestType',
                select: "RequestType"
            })
            .populate({
                path: 'CreatedBy',
                select: "name"
            })
            .lean();

        data.forEach(element => {
            if (element.RequestType) {
                element.RequestType = element.RequestType.RequestType;
            }
            if (element.CreatedBy) {
                element.CreatedBy = element.CreatedBy.name;
            }
        });

        const count = await this.countDocuments({ DocumentType: "ServiceRequest", createdAt: { $gte: From, $lte: Till } });
        return { count, data };


    } catch (err) {
        throw err;
    }
};

serviceRequestSchema.statics.getServiceRequestStateLogs = async function (data) {
    try {
        const result = await this.find({ DocumentType: "ServiceRequest", SR_ID: data.Sr_ID })
            .populate({ path: 'RequestType', select: "RequestType" })
            .populate({ path: 'CreatedBy', select: "name" })
            .populate({ path: 'WorkFlow', select: "WorkFlowName" })
            .populate({ path: 'SR_Data_Logs.CreatedBy', model: 'USER', select: "name" });

        return result;

    } catch (err) {
        throw err;
    }
};


serviceRequestSchema.statics.deleteServiceRequestById = function (id, callback) {
    this.deleteOne({ '_id': id }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};


function getModel(db) {
    return new Promise((resolve, reject) => {
        mongodb.getDataBaseConnection(db)
            .then((conn) => {
                let user = conn.model('MoldMaintenance', serviceRequestSchema, "MoldMaintenance")
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;