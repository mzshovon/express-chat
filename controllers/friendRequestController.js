const User = require('../models/Peoples');
const Conversation = require('../models/Conversation');

async function getFriendRequests(req, res, next) {
    try {
        const conversations = await Conversation.find({
            $or: [
              { "participant.id": req.user.userId },
            ],
            $and : [{
              isFriend : false
            }]
          });
          res.locals.data = conversations;
        res.render("friend-requests");
    } catch (error) {
        next(error);
    }
}

async function acceptOrReject(req, res, next) {
    try {
        if(req.body.responseStatus == "reject") {
            const conversation = await Conversation.deleteOne({_id : req.body.conversationId});
        } else {
            const conversation = await Conversation.findOneAndUpdate({_id : req.body.conversationId}, {isFriend : true});
        }
        res.status(200).json({
            message: req.body.responseStatus == "accept" ? "Friend request accepted successfully!" : "Friend request rejected!",
        });
    } catch (error) {
        res.status(500).json({
            errors: {
              common: {
                message: `${error}`,
              },
            },
        });
    }
}

module.exports = {
    getFriendRequests,
    acceptOrReject
};