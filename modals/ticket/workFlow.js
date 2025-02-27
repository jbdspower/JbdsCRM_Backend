const mongoose = require('mongoose')
let mongodb = require('../../utills/mongodb');
const errorFunction = require('../../utills/error');


const WorkFlowSchema = new mongoose.Schema({
    DocumentType: {
        type: String,
        required: true,
        default: "WorkFlow"
    },
    WorkFlowName: {
        type: String,
        required: true,
        trim: true,
    },
    Description: { type: String },
    State: [{
        StateName: { type: String },
        StateType: { type: String },
        Description: { type: String },
        FormName: { type: String },
        Fields: [{ type: Object }],
        Triggers: [{ type: Object }],
        Control: [{
            Control_Name: { type: String },
            Display_Name: { type: String },
            Description: { type: String },
            Action: { type: String, enum: ["Change State", "Update"] },
            NextStateName: { type: String },
            User_Roles_Eligible: [{ User: { type: mongoose.Schema.Types.ObjectId, ref: 'MoldMaintenance' } }],
            Action_On_User_Input: { type: String, enum: ["All", "Any"] },
            Log_Event_For_Action: { type: Boolean },
            Event_To_Log: [{
                Event: { type: String },
                FieldName: { type: String },
                DataType: { type: String }
            }],
            Send_Notification: { type: Boolean },
            Send_Notification_To: [{
                User: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'MoldMaintenance',
                    required: function () {
                        return this.Send_Notification === true;
                    }
                }
            }],
            Send_Notification_Upon: {
                type: String,
                enum: ["Input Received", "Action Taken"],
                required: function () {
                    return this.Send_Notification === true;
                }
            },
            Notification_Message: {
                type: String,
                required: function () {
                    return this.Send_Notification === true;
                }
            }
        }]
    }]
}, {
    timestamps: true
});

// WorkFlowSchema.index({ "DocumentType": 1 })

WorkFlowSchema.statics.createServiceRequestStateType = async function (data) {
    try {
        const existingCheckPointGroup = await this.findOne({ DocumentType: "WorkFlow", WorkFlowName: data.WorkFlowName });
        if (existingCheckPointGroup) {
            let error = errorFunction('Work flow already exists', 409, 'Duplicate Error')
            throw error;
        }
        for (let i = 0; i < data.State.length; i++) {
            for (let j = i + 1; j < data.State.length; j++) {
                if (data.State[i].StateName === data.State[j].StateName) {
                    let error = errorFunction('Duplicate State Name Not Allowed', 409, 'Duplicate Error')
                    throw error;
                }
            }
        }
        const newCheckPointGroup = new this(data);
        const result = await newCheckPointGroup.save();
        return result;
    } catch (err) {
        throw err
    }
};

WorkFlowSchema.statics.createWorkFlow = async function (data) {
    try {
        const result = this.updateOne({ WorkFlowName: data.WorkFlowName }, { $set: data })
        return result;

    } catch (err) {
        throw err
    }
};

WorkFlowSchema.statics.updateWorkFlowById = function (id, updateObj, callback, session) {
    this.updateOne({ _id: id }, { $set: updateObj }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    }).session(session);
};


WorkFlowSchema.statics.getAllWorkFlow = function (callback) {
    this.find({ DocumentType: "WorkFlow" }, function (err, data) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, data);
    });
};


WorkFlowSchema.statics.deleteWorkFlowById = function (id, callback) {
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
                let user = conn.model('MoldMaintenance', WorkFlowSchema, "MoldMaintenance")
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;