const mongoose = require('mongoose')
let mongodb = require('../../utills/mongodb');
const errorFunction = require('../../utills/error');

const leadSchema = new mongoose.Schema({
    Id: {
        type: String,
        required: true,
    },
    ClosureDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    Stage: {
        type: String
    },
    LeadValue: {
        type: Number,
        // required: true,
    },
    QuoteValue: {
        type: Number,
        // required: true,
    },
    QuotaionDate: {
        type: Date,
        default: new Date()
        // required: true,
    },
    StarIcon: {
        type: Boolean,
        required: true,
        default: false
    },
    FollowIcon: {
        type: Boolean,
        required: true,
        default: false
    },
    Company: {
        type: String,
        required: true,
    },
    Name: {
        type: String,
        required: true,
    },
    Mobile: {
        type: Number,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Address: {
        type: String,
        required: true,
    },
    City: {
        type: String,
        //required: true,
    },
    District: {
        type: String,
        //required: true,
    },
    Pin: {
        type: String,
        //required: true,
    },
    State: {
        type: String,
        //required: true,
    },
    Department: {
        type: String,
        required: true,
    },
    Designation: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
    },
    Category: {
        type: String,
        required: true,
    },
    Subject: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})


leadSchema.statics.createLead = async function (data) {
    try {
        const newCheckPointGroup = new this(data);
        const result = await newCheckPointGroup.save();
        return result;
    } catch (err) {
        throw err
    }
};

leadSchema.statics.getAllLeads = function (sortField = 'createdAt', sortOrder = 1, callback) {
    this.find({})
        .sort({ [sortField]: sortOrder }) // Sort by the specified field and order
        .exec(function (err, data) {
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
                let user = conn.model('Leads', leadSchema, "Leads")
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;