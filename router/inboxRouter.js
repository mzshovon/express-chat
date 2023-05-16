const express = require('express');
const {
        getInbox, 
        searchUser, 
        sendMessage, 
        addConversation, 
        getMessages, 
        videoCall, 
        audioCall, 
        getRoom, 
        blockUser, 
        getAudioRoom,
        deleteMessages
    } = require('../controllers/inboxConrtoller');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {checkLogin} = require('../middlewares/common/checkLogin');
const attachmentUpload = require('../middlewares/inbox/attachmentUpload');
const router = express.Router();

const page_title = "Inbox";

// Login page
router.get("/", decorateHtmlResponse(page_title), checkLogin, getInbox);

// search user for conversation
router.post("/search", checkLogin, searchUser);

// add conversation
router.post("/conversation", checkLogin, addConversation);

// get messages of a conversation
router.get("/messages/:conversation_id", checkLogin, getMessages);

// send message
router.post("/message", checkLogin, attachmentUpload, sendMessage);

// send message
router.post("/deleteMessages", checkLogin, attachmentUpload, deleteMessages);

// search user for conversation
router.post("/block", checkLogin, blockUser);

// Send request for video call
router.get("/videoCall", decorateHtmlResponse(page_title), checkLogin, videoCall);

// Send request for audio call
router.get("/audioCall", decorateHtmlResponse(page_title), checkLogin, audioCall);

// Redirect to audio/video room page to continue the call
router.get("/videoCall/:room", decorateHtmlResponse(page_title), checkLogin, getRoom);
router.get("/audioCall/:room", decorateHtmlResponse(page_title), checkLogin, getAudioRoom);

module.exports = router;