const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const parseCookie = require('cookie-parser');
const cookieParser = require('cookie-parser');

// For routing
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
app.use("view engine","ejs");

// Set public file path
app.use(express.static(path.join(__dirname, "public")));

// Set the secret key
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));