const express = require('express');
const {getInbox} = require('../controllers/inboxConrtoller');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {checkLogin} = require('../middlewares/common/checkLogin');
const router = express.Router();

const page_title = "Inbox";

// Login page
router.get("/", decorateHtmlResponse(page_title), checkLogin, getInbox);


module.exports = router;