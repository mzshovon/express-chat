const bcrypt = require('bcrypt');
const User = require('../models/Peoples');
const {unlink} = require('fs');
const path = require("path");

async function getUsers(req, res, next) {
    try {
        if(req.user.role == "admin") {
            const users = await User.find({});
            res.render("users", {
                title: "User - Express Chat Application",
                users : users
            });
        } else {
            res.status(401).json({
                errors : {
                    common : {
                        message : "Unauthorized Action!"
                    }
                }
            })
        }
    } catch (error) {
        next(error);
    }
}

async function addUsers(req, res, next) {
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
        res.status(200).json({
            message : "User Added Successfully"
        });
    } catch (err) {
        res.status(500).json({
            errors : {
                common : {
                    message : err
                }
            }
        })
    }
}

async function removeUser(req, res, next) {
    try {
        const user = await User.findByIdAndDelete({
            _id : req.params.id
        });
        if(user.profile_image) {
            unlink(
                path.join(__dirname, `../public/profileImages/${user.profile_image}`),
                (err) => {
                  if (err) console.log(err);
                }
            );
        }
        res.status(200).json({
            message : "User Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json({
            errors : {
                common : {
                    message : err
                }
            }
        })
    }
}

module.exports = {
    getUsers,
    addUsers,
    removeUser
};