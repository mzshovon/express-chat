const {check, validationResult} = require('express-validator');
const createError = require('http-errors');
const {unlink} = require('fs');

// Model imports
const User = require('../../models/Peoples');

const checkUserRegistrationValidity = [
    check("name")
        .isLength({min : 1})
        .withMessage("Name is required")
        .isAlpha("en-US", {ignore : " -"})
        .withMessage("Name won't allowed any special character")
        .trim(),

    check("email")
        .isLength({min : 1})
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email format")
        .trim()
        .custom(async (value) => {
            try {
                const user = await User.findOne({email : value});
                if(user) {
                    throw createError("Email is already in use!");
                }
            } catch (err) {
                throw createError(err);
            }
        }),

    check("mobile")
        .isLength({min : 1})
        .withMessage("Mobile is required")
        .isMobilePhone("bn-BD", {
            strictMode : true
        })
        .withMessage("Invalid Mobile Number")
        .trim()
        .custom(async (value) => {
            try {
                const user = await User.findOne({mobile : value});
                if(user) {
                    throw createError("Mobile is already in use!");
                }
            } catch (err) {
                throw createError(err);
            }
        }),

    check("password")
        .isStrongPassword()
        .withMessage("Password is weak. Please use minimum 8 characters, min 1 lowercase, 1 uppercase, 1 numeric, 1 special character"),
];

const checkUserRegistrationValidityResponse = function(req, res, next) {
    const errors = validationResult(req);
    const prettyErrorFormat = errors.mapped();

    if(Object.keys(prettyErrorFormat).length === 0) {
        next();
    } else {
        if(req.files.length > 0) {
            const {filename} = req.files[0];
            unlink(
                path.join(__dirname, `../../public/profileImages/${req.filename}`),
                (fileUploadErr) => {
                    if(fileUploadErr) {
                        console.log(fileUploadErr);
                    }
                }
            );
        }
        res.status(500).json({
            errors : prettyErrorFormat
        });
    }
}

module.exports = {
    checkUserRegistrationValidity,
    checkUserRegistrationValidityResponse,
}