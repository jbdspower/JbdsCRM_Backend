const mongoose = require('mongoose')
let mongodb = require('../../utills/mongodb');

const sticketCommentSchema = new mongoose.Schema({
    TicketId: {
        type: String,
        required: true,
    },
    CommentBy: {
        type: String,
    },
    CommentDate: {
        type: Date,
        trim: true,
    },
    Message: {
        type: String,
        required: true,
    },
    NotificationTo: [
        {
            User: { type: String },
            SendAt: { type: Date,default:new Date() },
        }
    ]
}, {
    timestamps: true
})


sticketCommentSchema.statics.createComment = async function (data) {
    try {
        const modal = new this(data);
        const result = await modal.save();
        return result;
    } catch (err) {
        throw err
    }
};

// sticketCommentSchema.statics.updateCommentById = function (id, updateObj, callback, session) {
//     this.updateOne({ _id: id }, { $set: updateObj }, function (err, data) {
//         if (err) {
//             return callback(err, null);
//         }
//         return callback(null, data);
//     }).session(session);
// };


// sticketCommentSchema.statics.getTicketComment = async function (From, Till, skipCount, PageSize) {
//     try {
//         let data = await this.find
//             ({
//                 DocumentType: "ServiceRequest", createdAt: { $gte: From, $lte: Till }
//             })
//             .sort({ createdAt: -1 })
//             .skip(skipCount)
//             .limit(PageSize)
//             .populate({
//                 path: 'RequestType',
//                 select: "RequestType"
//             })
//             .populate({
//                 path: 'CreatedBy',
//                 select: "name"
//             })
//             .lean();

//         data.forEach(element => {
//             if (element.RequestType) {
//                 element.RequestType = element.RequestType.RequestType;
//             }
//             if (element.CreatedBy) {
//                 element.CreatedBy = element.CreatedBy.name;
//             }
//         });

//         const count = await this.countDocuments({ DocumentType: "ServiceRequest", createdAt: { $gte: From, $lte: Till } });
//         return { count, data };


//     } catch (err) {
//         throw err;
//     }
// };

sticketCommentSchema.statics.getTicketComment = async function (data) {
    try {
        const result = await this.find({ });

        return result;

    } catch (err) {
        throw err;
    }
};


sticketCommentSchema.statics.deleteCommentById = function (id, callback) {
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
                let user = conn.model('TicketComment', sticketCommentSchema, "TicketComment")
                resolve(user);
            })
            .catch((err) => {
                reject(err);
            })
    })
}


module.exports.getModel = getModel;