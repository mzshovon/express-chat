const bcrypt = require('bcrypt');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require("../models/Peoples");

function getLogin(req, res, next) {
    res.render("index");
}

async function loginUser(req, res, next) {
    try {
        const user = await User.findOne({
            $or : [{email : req.body.username}, {mobile : req.body.username}],
        });

        if(user && user._id) {
            const validatePassword = await bcrypt.compare(req.body.password, user.password);
            if(validatePassword) {
                const userObject = {
                    username : user.name,
                    email : user.email,
                    mobile : user.mobile,
                    role : user.role,
                };
                const token = jwt.sign(userObject, process.env.JWT_SECRET_KEY, {
                    expiresIn : process.env.JWT_EXPIRY
                });
                res.cookie(process.env.COOKIE_NAME, token, {
                    maxAge : process.env.JWT_EXPIRY,
                    httpOnly : true,
                    signed : true,
                });

                res.locals.loggedInUser = userObject;
                res.render("inbox");
            } else {
                throw createError("Wrong password given!");
            }
        } else {
            throw createError("Wrong username given!");
        }
        
    } catch (error) {
        res.render("index", {
            data : {
                username : req.body.username
            },
            errors : {
                common : {
                    message : error.message
                }
            }
        })
    }
}

function logout(req, res) {
    res.clearCookie(process.env.COOKIE_NAME);
    res.send("User logged out successfully!");
}

module.exports = {
    getLogin,
    loginUser,
    logout
};