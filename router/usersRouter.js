const express = require('express');
const {getUsers, addUsers, removeUser} = require('../controllers/userController');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const profileImageUploader = require('../middlewares/users/profileImageUploader');
const {checkUserRegistrationValidity, checkUserRegistrationValidityResponse} = require('../middlewares/users/usersValidator');
const { route } = require('./loginRouter');
const router = express.Router();


// Login page
router.get("/", decorateHtmlResponse("Users"), getUsers);
router.post("/", profileImageUploader, 
                checkUserRegistrationValidity, 
                checkUserRegistrationValidityResponse,
                addUsers
                );
router.delete("/:id", removeUser);

module.exports = router;