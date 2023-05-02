const express = require('express');
const {getInbox, searchUser, sendMessage, addConversation, getMessages, videoCall, getRoom, blockUser} = require('../controllers/inboxConrtoller');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {checkLogin} = require('../middlewares/common/checkLogin');
const attachmentUpload = require('../middlewares/inbox/attachmentUpload');
const router = express.Router();

const page_title = "Inbox";

// Login page
router.get("/", decorateHtmlResponse(page_title), checkLogin, getInbox);

// search user for conversation
router.post("/search", checkLogin, searchUser);

// search user for conversation
router.post("/block", checkLogin, blockUser);

// add conversation
router.post("/conversation", checkLogin, addConversation);

// get messages of a conversation
router.get("/messages/:conversation_id", checkLogin, getMessages);

// send message
router.post("/message", checkLogin, attachmentUpload, sendMessage);

router.get("/videoCall", decorateHtmlResponse(page_title), checkLogin, videoCall);

router.get("/videoCall/:room", decorateHtmlResponse(page_title), checkLogin, getRoom);

module.exports = router;