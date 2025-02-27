let userAuth = require('./routes_userAuth');
let serviceRequest = require('./routes_ticket');
let user = require('./routes_userManagement');
let categoryProduct = require('./route_categoryProduct');
let master = require('./routes_master');
let reporting=require('./route_reporting')
const calendar=require('./route_calendar')
const lead=require('./routes_lead')

module.exports.setRoutes = function (app) {
    userAuth.setRoutes(app);
    serviceRequest.setRoutes(app);
    user.setRoutes(app);
    categoryProduct.setRoutes(app);
    master.setRoutes(app);
    reporting.setRoutes(app);
    calendar.setRoutes(app);
    lead.setRoutes(app);
}
