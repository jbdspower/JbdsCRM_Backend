'use strict';
let mongoose = require('mongoose');
let MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
require('dotenv').config();
const dbConfig = require('../config/database.config')
var debug = require('debug')('app:middleware:registerModels');
var path = __dirname + '/../modals';
// const process.env = require('../config/db_connection_string.json');
//let connections = {}
var models = [];
var connections = [];

var dbOptionsGlobal = {};

let defaults = {
    host: '127.0.0.1',
    port: '27017',
    dbName: 'LeafNetAdminDb'
};

module.exports.MDbConnect = function (dbOptions, callback) {
    dbOptionsGlobal = { ...dbOptions }
    let connectionString = process.env.CONNECTIONSTRINGFORTEST + dbOptions.dbName + process.env.additionalConnectionString;
    return mongoose.createConnection(connectionString, dbConfig.Options, function (err, conn) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
            //setTimeout(connectWithRetry, 5000);
        }
        else {
            connections['LeafNetAdminDb'] = conn
            console.info('Database Connected Successfully')
            callback(null);
        }
    });
};




module.exports.createFactoryConnection = function createFactoryConnection(dbName, modelName) {
    // if the connection is cached on the array, reuse it
    if (connections[dbName]) {
        debug('reusing connection', dbName, '...');
    } else {
        debug('creating new connection to', dbName, '...');
        connections[dbName] = mongoose.createConnection('mongodb://localhost:27017/' + dbName);
    }

    if (models[dbName]) {
        debug('reusing models');
    } else {
        var instanceModels = [];
        var folder = fs.readdirSync(path);
        let schemas = []
        folder.forEach(one => {
            let schema = []
            let embedPath = [path, one].join('/')
            let files = fs.readdirSync(embedPath);
            files.forEach(file => {
                schema.push(file)
            })
            let obj = {};
            obj.path = embedPath
            obj.schema = schema;
            schemas.push(obj);
        })
        debug('registering models');
        schemas.forEach(function (schema) {
            schema.schema.forEach(schemaFile => {
                var model = schemaFile.split('.').shift();
                instanceModels[model] = connections[dbName].model(model, require([schema.path, schemaFile].join('/')), model);
            })
        });
        models[dbName] = instanceModels;
    }
    return models[dbName][modelName];
}


module.exports.getCollection = function (dbName, collName) {
    return new Promise((resolve, reject) => {
        let connectionStringForDeployedCluster = process.env.CONNECTIONSTRINGFORTEST + dbName + process.env.additionalConnectionString;
        MongoClient.connect(connectionStringForDeployedCluster, { useUnifiedTopology: true }, async (err, client) => {
            let Database = await client.db(dbName);
            if (err != null) {
                reject(err);
            }
            resolve(Database.collection(collName))

        })

    })
}

module.exports.getDataBaseConnection = function getDataBaseConnection(dbName) {
    return new Promise((resolve, reject) => {
        if (connections[dbName]) {
            resolve(connections[dbName])
        } else {
            let connectionString = process.env.CONNECTIONSTRINGFORTEST + dbName + process.env.additionalConnectionString;
            let conn;
            mongoose.createConnection(connectionString, dbConfig.Options)
                .then((result) => {
                    conn = result;
                    connections[dbName] = conn;
                    return registerModelsToConnection(dbName)
                })
                .then((result) => {
                    resolve(conn);
                })
                .catch((err) => {
                    reject(err)
                })
        }
    })
}


// module.exports.getDataBaseConnection = async function getDataBaseConnection(dbName) {
//     await registerModelsToConnection(dbName)
//   return connections[dbConfig.DatabaseName].useDb(dbName)
// }


function registerModelsToConnection(dbName) {
    return new Promise((resolve, reject) => {
        let ModelsArray = []
        let doArr = [];

        //ModelsArray[0] = require('../modals/mould/mould');
        ModelsArray[0] = require('../modals/userManagement/user');
        //ModelsArray[2] = require('../modals/userManagement/userGroup');
        //ModelsArray[3] = require('../modals/userManagement/userRights');
        ModelsArray[1] = require('../modals/userManagement/userRole');
        ModelsArray[2] = require('../modals/userManagement/permission');
        ModelsArray[3] = require('../modals/productDetails/categroy');
        ModelsArray[4] = require('../modals/productDetails/product');

        ModelsArray.forEach(model => {
            doArr.push(model.getModel(dbName))
        })
        Promise.all(doArr).then((result) => {
            resolve('Register')
        })
            .catch((err) => {
                reject(err)
            })
    })
}
