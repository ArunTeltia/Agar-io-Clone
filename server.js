const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
const socketio = require('socket.io');
const expressServer = app.listen(8000);
const io = socketio(expressServer);
const helmet = require('helmet')
app.use(helmet());
console.log("express and socketio server listening on port 8080")

//App orgnisation
module.exports = {
    app, io
}
