const express = require('express');
const decorateHtmlResponse = require('../middlewares/common/decorateHtmlRespose');
const {checkLogin} = require('../middlewares/common/checkLogin');
const {getFriendRequests, acceptOrReject} = require("../controllers/friendRequestController");
const router = express.Router();

const page_title = "Friend Requests";

// Friend List page
router.get("/", decorateHtmlResponse(page_title), checkLogin, getFriendRequests);

// Accept/Reject friend request
router.post("/acceptOrReject", decorateHtmlResponse(page_title), checkLogin, acceptOrReject);

module.exports = router;