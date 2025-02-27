#!/usr/bin/env node
'use strict';

/**
 * Module dependencies.
 */
const app = require('../app');
const socketIo = require("socket.io");
const http = require('http');
const https = require('https');
const fs = require('fs');



/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || 4002);
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
// var io = require('socket.io')(server, { origins: '*:*'});  OR
// io.set('origins', '*:*'); OR
const server = http.createServer(app);
//Socket io Event listner
const io = socketIo(server);
io.origins('*:*')
io.on("connection", (socket) => {
    // let inetrval
    console.log('Connected')
    // console.log(socket.id)
    // inetrval = setInterval(() => {
    //     socket.emit("FromAPI", new Date(Date.now()));
    // }, 1000)
    // socket.on("disconnect", () => {
    //     console.log("Client disconnected");
    //     clearInterval(inetrval);
    // });
});

function emit(data) {
    io.sockets.emit('FromLeafnet.cc', "testMessage", "This is a test message from the server.");
}

//   const options = {
//     key: fs.readFileSync("/etc/letsencrypt/live/saffroninstruments.com/privkey.pem"),
//     cert: fs.readFileSync("/etc/letsencrypt/live/saffroninstruments.com/fullchain.pem")
//   };

/**
 * Create HTTP server.
 */
// "192.168.17.19
server.listen(app.get("port"), () => {
    console.info("Listening on port: " + port);
});

module.exports = {
    emit
}
