let mongoose = require('mongoose');
let mongodb = require('../../utills/mongodb')

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
       
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    userId:{
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true,
    }
}, {
    timestamps: true
});





eventSchema.statics.getAllEvent = function (query,callback) {
    this.find(query, function (err, data) {
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
                let userRole = conn.model('Events', eventSchema, "Events")
                resolve(userRole);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;