const {check, validationResult} = require('express-validator');

// Model imports
// const User = require('../../models/Peoples');
const loginValidator = [
    check("username")
        .isLength({min : 1})
        .withMessage("Mobile number or email required"),

    check("password")
        .isLength({min : 1})
        .withMessage("Password required"),
];

const loginValidatorHandler = function(req, res, next) {
    const errors = validationResult(req);
    const prettyErrorFormat = errors.mapped();

    if(Object.keys(prettyErrorFormat).length === 0) {
        next();
    } else {
        res.render("index", {
            data : {
                username : req.body.username
            },
            errors : prettyErrorFormat
        })
    }
}

module.exports = {
    loginValidator,
    loginValidatorHandler,
}