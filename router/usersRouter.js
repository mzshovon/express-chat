const express = require('express');
const {getUsers} = require('../controllers/userController');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const router = express.Router();


// Login page
router.get("/", decorateHtmlResponse("Users"), getUsers);


module.exports = router;