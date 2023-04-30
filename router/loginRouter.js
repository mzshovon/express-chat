const express = require('express');
const {getLogin, getRegister, registerUser, loginUser, logout} = require('../controllers/loginController');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {redirectLoggedIn} = require('../middlewares/common/checkLogin');
const profileImageUploader = require('../middlewares/users/profileImageUploader');
const {checkUserRegistrationValidity, checkUserRegistrationValidityResponse} = require('../middlewares/users/usersValidator');
const {loginValidator, loginValidatorHandler} = require('../middlewares/authentication/loginValidator');
const router = express.Router();

const page_title = "Login";
const register_page_title = "Register";
// Login page
router.get("/", decorateHtmlResponse(page_title), redirectLoggedIn, getLogin);
router.post("/", 
            decorateHtmlResponse(page_title), 
            loginValidator, 
            loginValidatorHandler, 
            loginUser);

router.get("/register", decorateHtmlResponse(register_page_title), getRegister);
router.post("/register", 
            decorateHtmlResponse(register_page_title), 
            profileImageUploader, 
            checkUserRegistrationValidity, 
            checkUserRegistrationValidityResponse,
            registerUser
            );
router.delete("/", logout);

module.exports = router; 