'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dbConfig = require('./config/database.config')
const cors = require('cors');
const webPush = require('web-push');
const logger = require('morgan');
const key = require('./config/key.json');
const mongodb = require('./utills/mongodb');
const routes = require('./routes/routes');
const path = require('path');
const CheckDbConnection = require('./middleware/checkDatabaseConnection');

webPush.setVapidDetails('mailto:sandy199444@gmail.com', key.public_key, key.private_key);

//const multer = require('multer');


const app = express();
app.use(cors());
app.use(logger('dev'));

// const EmitLogs = require('./middleware/emitLogs');




app.use(bodyParser.json({}));
// app.use(bodyParser.urlencoded({ extended: false }));
//app.use(logger)
// app.use(auth)
// app.use(EmitLogs);
app.use(function (req, res, next) {
    // res.set('Content-Type', '*')
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS,PATCH");
    next();
});


//SET ROUTES FOR APIS
let routerV1 = express.Router();
routes.setRoutes(routerV1);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/' + dbConfig.AppName + '/api', routerV1);
// app.use('/api', routerV1);

// app.use(`/${dbConfig.AppName}/api/liveReporting${routerV1}`);

// app.use('/docs', express.static('docs'));

routerV1.get('/BackendVersion', (req, res) => {
    res.status(200).send({ Version: dbConfig.Version })
})
app.get('/health', CheckDbConnection, (req, res) => {
    console.log('Health Check Rcvd   ' + new Date(Date.now()));
    res.status(200).send(new Date(Date.now()).toString());
})


let dbOptions = {
    host1: process.env.DB_HOST || 'localhost',//"3.7.248.55",
    port1: 27017,
    host2: process.env.DB_HOST || 'localhost',//"3.7.248.55",
    port2: 27018,
    host3: process.env.DB_HOST || 'localhost',//"3.7.248.55",
    port3: 27019,
    dbName: process.env.APP_ENV ? process.env.APP_ENV + '-' + appConfig.db.dbName : dbConfig.DatabaseName
};

mongodb.MDbConnect(dbOptions, function (err) {
    if (err) {
        console.log("Unable to connect to mongo db >>" + err);
        throw new Error(err);
    } else {
        console.log('connected to mongodb - host = %s, port = %s, database = %s', dbOptions.host1, dbOptions.port1, dbOptions.dbName);
        console.log('connected to mongodb - host = %s, port = %s, database = %s', dbOptions.host2, dbOptions.port2, dbOptions.dbName);
        console.log('connected to mongodb - host = %s, port = %s, database = %s', dbOptions.host3, dbOptions.port3, dbOptions.dbName);
    }
});


module.exports = app;




