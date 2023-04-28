const express = require('express');
const {getUsers, addUsers, removeUser} = require('../controllers/userController');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const profileImageUploader = require('../middlewares/users/profileImageUploader');
const {checkUserRegistrationValidity, checkUserRegistrationValidityResponse} = require('../middlewares/users/usersValidator');
const {checkLogin} = require('../middlewares/common/checkLogin');
const router = express.Router();

const page_title = "Users";
// Login page
router.get("/", decorateHtmlResponse(page_title), checkLogin, getUsers);
router.post("/", checkLogin, profileImageUploader, 
                checkUserRegistrationValidity, 
                checkUserRegistrationValidityResponse,
                addUsers
                );
router.delete("/:id", checkLogin, removeUser);

module.exports = router;