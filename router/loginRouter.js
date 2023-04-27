const express = require('express');
const {getLogin} = require('../controllers/loginController');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const router = express.Router();


// Login page
router.get("/", decorateHtmlResponse("Login"), getLogin);


module.exports = router;