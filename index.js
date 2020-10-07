// const http = require('http');
// const app = require('./app');

// const port = process.env.PORT || 3000;

// const server = http.createServer(app);
// let io = require('socket.io')(server);

// app.set('socketio', io);

// io.on('connection', socket => {  
//    console.log("connected");
//    socket.on('hello', function (msg) {
//       console.log(msg);
//    });
// });

// server.listen(port, () => console.log(`Server created on port ${port}`));