let mongoose = require("mongoose");
let validator = require("validator");
const role = require('./userRole')
const mongodb = require("../../utills/mongodb");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dbConfig = require('../../config/database.config');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // unique: true,
      trim: true,
      required: true,
      //lowercase: true,
    },
    active: { type: Boolean, default: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      minlength: 4,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },

    designation: {
      type: String,
      // unique: true,
      trim: true,
      required: true,
      //lowercase: true,
    },
    department: {
      type: String,
      // unique: true,
      trim: true,
      required: true,
      //lowercase: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      //unique: true,
      match: [/^\d{10}$/, "is invalid"], // Assuming a 10-digit number
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    // joiningDate: {
    //     type: Date,
    //     required: true,
    // },
    // dateOfBirth: {
    //   type: Date,
    //   required: true,
    // },
    language: {
      type: String,
      default: "English",
    },
    address: {
      type: String,
      //   default: "English",
    },
    // NotificationEscalateTime: {
    //     type: Number,
    // },
    // userType: {
    //   type: String,
    //   required: true,
    //   toLowerCase: true,
    //   validate(value) {
    //     if (value == "user" || value == "admin") {
    //     } else {
    //       throw new Error("Invalid User Role");
    //     }
    //   },
    // },
    // UserGroup: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "UserGroup",
    // },
    userRole: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // default: "default",
      ref: "UserRole",
    },

    // userRole: {
    //     type: String,
    //     default: "English",
    //   },

    enabled: {
      type: Boolean,
      default: true,
    },
    tokens: [
      {
        authToken: { type: String },
        notificationSubscription: { type: Object },
        createdAt: { type: Date },
      },
    ],
    // modified: [
    //   {
    //     user: { type: String },
    //     modifiedAt: { type: Date },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.changePassword = function (newpassword) {
  return new Promise((resolve, reject) => {
    const user = this
    if (newpassword == null) {
      newpassword = crypto.randomBytes(2).toString('hex');
      user.password = newpassword
      user.save()
        .then((result) => {
          resolve(newpassword)
        })
        .catch((err) => {
          reject(err)
        })
    }
    else {
      user.password = newpassword
      user.save()
        .then((result) => {
          resolve(newpassword)
        })
        .catch((err) => {
          reject(err)
        })
    }
  })
}


userSchema.methods.generateAuthToken = function (db, Company) {
  return new Promise(async (resolve, reject) => {
    const user = this
    let token;
    const roleModal = await role.getModel(db);
    const roles = await roleModal.findOne({ _id: user.userRole }).lean()
    //userRights.getModel(db)
    // .then((model) => {
    // return model.findOne({ email: user._id })
    //})
    //.then((rights) => {
    // if (rights) {
    const tokenData = jwt.sign({ role: roles.UserRole, _id: user._id.toString(), name: user.name, email: user.email, }, dbConfig.Signature)
    //}
    // })

    token = tokenData;
    resolve(token);
    // .then((tokenData) => {

    //     return token
    // })
    // .then((result) => {
    //     resolve(token);
    // })
    // .catch((err) => {
    //     reject(err)
    // })
  })
}

//======================harshit===================
const errorFunction = (message, statusCode, errorType) => {
  return {
      message: message,
      statusCode:400,
       errorType: errorType
  };
};
//======================harshit===================


userSchema.statics.findByCredentials = (email, password, model) => {
  let user = model
  return new Promise((resolve, reject) => {
    console.log(email)
    let doc;
    user.findOne({ email: email })
      .then((user) => {
        if (!user) {
          throw new Error('Unable to login due to wrong credentials')
        }
        doc = user;
        return bcrypt.compare(password, user.password)
      })
      .then((isMatch) => {
        if (!isMatch) {
          throw new Error('Wrong Existing Password');
        }
        else {
          resolve(doc);
        }
      })
      .catch((err) => {
        console.error("Login Error:", err); // Log the actual error
        let error = errorFunction(`${err}`, 'User Not Exist');
        reject(error);
    });
    
  })
}
userSchema.statics.getAllUser = function (callback) {
  this.find({})
    .populate('userRole', 'UserRole')  // Populate the userRole field
    .exec(function (err, users) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, users);
    });
};

userSchema.statics.getUserByRole = function (role, callback) {
  this.find({})
    .populate('userRole', 'UserRole')  // Populate the userRole field
    .exec(function (err, users) {
      if (err) {
        return callback(err, null);
      }
      users = users.filter((one) => one.userRole.UserRole == role)
      return callback(null, users);
    });
};

userSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    bcrypt.hash(user.password, 8)
      .then((result) => {
        user.password = result
        next()
      })
      .catch((err) => {
        return new Error(err)
      })
  }
  else {
    next()
  }
})

userSchema.statics.deleteUserById = function (id, dbName, callback) {
  this.deleteOne({ _id: id })
    .then((result) => {
      return userRights.getModel(dbName);
    })
    .then((model) => {
      return model.deleteOne({ email: id });
    })
    .then((result) => {
      callback(null, result);
    })
    .catch((err) => {
      callback(null, err);
    });
};


function getModel(db) {
  return new Promise((resolve, reject) => {
    mongodb
      .getDataBaseConnection(db)
      .then((conn) => {
        let user = conn.model("USER", userSchema, "User");
        resolve(user);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
module.exports.getModel = getModel;
