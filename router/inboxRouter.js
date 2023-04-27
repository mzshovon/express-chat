const express = require('express');
const {getInbox} = require('../controllers/inboxConrtoller');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const router = express.Router();


// Login page
router.get("/", decorateHtmlResponse("Inbox"), getInbox);


module.exports = router;