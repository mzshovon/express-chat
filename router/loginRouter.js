const express = require('express');
const {getLogin, loginUser, logout} = require('../controllers/loginController');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {redirectLoggedIn} = require('../middlewares/common/checkLogin');
const {loginValidator, loginValidatorHandler} = require('../middlewares/authentication/loginValidator');
const router = express.Router();

const page_title = "Login";
// Login page
router.get("/", decorateHtmlResponse(page_title), redirectLoggedIn, getLogin);
router.post("/", 
            decorateHtmlResponse(page_title), 
            loginValidator, 
            loginValidatorHandler, 
            loginUser);
router.delete("/", logout);

module.exports = router; 