var sslPath = '/etc/letsencrypt/live/common.marketjs-multiplayer.com/';
var privateKey = null;
var certificate = null;

var httpsAvailable = false;

console.log("init server");


try {
    var fs = require('fs');
    privateKey = fs.readFileSync(sslPath + 'privkey.pem');
    certificate = fs.readFileSync(sslPath + 'fullchain.pem');
    httpsAvailable = true;
} catch (err) {
    console.log('certificates not found');
    httpsAvailable = false;
}

var credentials = {
    key: privateKey,
    cert: certificate
};


var app = require('express')();
var http = require('http').Server(app);
var https = require('https').Server(credentials, app);

var http_port = 3550;
var https_port = 3551;

var io = require('socket.io')(http);
var io_https = require('socket.io')(https);



var MjsServer = require('./server.js').MjsServer;


var server = new MjsServer();

//Set up server messages
var handler = function (socket) {
    server.onClientConnect(socket);
    socket.on('disconnect', function () {
        server.onClientDisconnect(socket);
    });
    socket.on(server.MESSAGE_TAG, function (data) {
        server.onClientMessage(socket, data);
    });
    socket.on(server.PING_TAG, function (data) {
        server.onClientPing(socket, data);
    });
    socket.on(server.PING_REPLY_TAG, function (data) {
        server.onClientPingReply(socket, data);
    });
};

io.on('connection', handler);
io_https.on('connection', handler);


http.listen(http_port, function () {
    console.log('listening on *:' + http_port);
});


if (httpsAvailable) {
    https.listen(https_port, function () {
        console.log('listening on *:' + https_port);
    });
}
