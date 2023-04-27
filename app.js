// External imports
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const parseCookie = require('cookie-parser');
const cookieParser = require('cookie-parser');

//Internal imports
const {notFoundHandler, errorHandler} = require('./middlewares/common/errorHandler');

// Routes imports
const loginRouter = require('./router/loginRouter');
const usersRouter = require('./router/usersRouter');
const inboxRouter = require('./router/inboxRouter');

// For Routing
const app = express();

// For getting .env property
dotenv.config();

// Database connection
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=> console.log('connection established successfully!'))
    .catch( err => console.log(err));

// For initializing form request property
app.use(express.json());
app.use(express.urlencoded({extended : true}));

// Set the template engine
app.set("view engine","ejs");

// Set public file path
app.use(express.static(path.join(__dirname, "public")));

// Setup the router
app.use('/', loginRouter);
app.use('/users', usersRouter);
app.use('/inbox', inboxRouter);

// Set the secret key
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));

// Set the views
app.set('views',  [path.join(__dirname, 'views'),path.join(__dirname, 'views/errors')]);

// 404 error handler
app.use(notFoundHandler);

// Default error handler
app.use(errorHandler);

// Listening to the port
app.listen(process.env.APPLICATION_PORT, () => {
    console.log(`Listening to port ${process.env.APPLICATION_PORT}`);
})