const bcrypt = require('bcrypt');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require("../models/Peoples");

function getLogin(req, res, next) {
    res.render("index");
}

function getRegister(req, res, next) {
    res.render("register");
}

async function registerUser(req, res, next) {
    try {
        let newUser;
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        if(req.files && req.files.length > 0) {
            newUser = new User({
                ...req.body,
                profile_image : req.files[0].filename,
                password : hashedPassword
            });
        } else {
            newUser = new User({
                ...req.body,
                password : hashedPassword
            });
        }
        await newUser.save();
        // res.status(200).json({
        //     message : "User Added Successfully"
        // });
        res.redirect("/");
    } catch (err) {
        res.render("register", {
            data : {
                name : req.body.name,
                email : req.body.email,
                mobile : req.body.mobile,
            },
            errors : {
                common : {
                    message : error.message
                }
            }
        })
    }
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
                    userId : user._id,
                    username : user.name,
                    email : user.email,
                    mobile : user.mobile,
                    status : user.status,
                    role : user.role || "user",
                    profile_image : user.profile_image || null
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
                global.io.emit("login" , { activeUsers : { 'userId' : user._id } });
                res.redirect("inbox");
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
    getRegister,
    registerUser,
    loginUser,
    logout
};