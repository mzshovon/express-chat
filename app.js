// External imports
const express = require('express');
const http = require("http");
const cors = require("cors");
const PeerServer = require("peer").PeerServer;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const moment = require('moment');
// Routes imports
const loginRouter = require('./router/loginRouter');
const usersRouter = require('./router/usersRouter');
const inboxRouter = require('./router/inboxRouter');

//Internal imports
const {notFoundHandler, errorHandler} = require('./middlewares/common/errorHandler');

// For Routing
const app = express();
const server = http.createServer(app);
dotenv.config();

// socket creation
const io = require("socket.io")(server, {
    cors : {
      origin : "*",
      methods : ["GET", "PUT", "POST", "DELETE"]
    }
});
global.io = io;

// Set moment as local var
app.locals.moment = moment;

// Database connection
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=> console.log('connection established successfully!'))
    .catch( err => console.log(err));

app.use(cors());
// For initializing form request property
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Set the template engine
app.set("view engine","ejs");

// Set the views
app.set('views',  [path.join(__dirname, 'views'),path.join(__dirname, 'views/errors')]);

// Set public file path
app.use(express.static(path.join(__dirname, "public")));

// Set the secret key
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));

// Setup the router
app.use('/', loginRouter);
app.use('/users', usersRouter);
app.use('/inbox', inboxRouter);

const peerServer = PeerServer({port : 9191, path: "/peerjs"});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.broadcast.to(roomId).emit('user-connected', userId)
      // This line here
  
      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId)
      })
    })
})
// 404 error handler
app.use(notFoundHandler);

// Default error handler
app.use(errorHandler);

// Listening to the port
server.listen(process.env.APPLICATION_PORT, () => {
    console.log(`Listening to port ${process.env.APPLICATION_PORT}`);
})