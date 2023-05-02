// external imports
const createError = require("http-errors");
// internal imports
const User = require("../models/Peoples");
const {v4 : uuidV4} = require('uuid');
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const escape = require("../utilites/escape");


async function getInbox(req, res, next) {
    try {
        const conversations = await Conversation.find({
          $or: [
            { "creator.id": req.user.userId },
            { "participant.id": req.user.userId },
          ],
        });
        res.locals.data = conversations;
        res.render("inbox");
      } catch (err) {
        next(err);
      }
}

// search user
async function searchUser(req, res, next) {
    const user = req.body.user;
    const searchQuery = user.replace("+88", "");
  
    const name_search_regex = new RegExp(escape(searchQuery), "i");
    const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
    const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");
  
    try {
      if (searchQuery !== "") {
        const users = await User.find(
          {            
            _id : {
                $nin : [
                  req.user.userId
                ]
              },
            $or: [
              {
                name: name_search_regex,
              },
              {
                mobile: mobile_search_regex,
              },
              {
                email: email_search_regex,
              },
            ],
          },
          "name profile_image status"
        );
        res.json(users);
      } else {
        throw createError("You must provide some text to search!");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          common: {
            message: err.message,
          },
        },
      });
    }
  }
  

// search user
async function blockUser(req, res, next) {
    const user = req.body.user;
    const searchQuery = user.replace("+88", "");
  
    const name_search_regex = new RegExp(escape(searchQuery), "i");
    const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
    const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");
  
    try {
      if (searchQuery !== "") {
        const users = await User.find(
          {            
            _id : {
                $nin : [
                  req.user.userId
                ]
              },
            $or: [
              {
                name: name_search_regex,
              },
              {
                mobile: mobile_search_regex,
              },
              {
                email: email_search_regex,
              },
            ],
          },
          "name profile_image"
        );
        res.json(users);
      } else {
        throw createError("You must provide some text to search!");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          common: {
            message: err.message,
          },
        },
      });
    }
}
  
  // add conversation
  async function addConversation(req, res, next) {
    try {
      const newConversation = new Conversation({
        creator: {
          id: req.user.userId,
          name: req.user.username,
          status: req.user.status,
          profile_image: req.user.profile_image || null,
        },
        participant: {
          name: req.body.participant,
          id: req.body.id,
          status : req.body.status,
          profile_image: req.body.profile_image || null,
        },
      });
      const findAlreadyExistsConversation = await Conversation.find({
        $and : [
          {
            $or : [
              { "creator.id": req.user.userId },
              { "participant.id": req.user.userId },
            ],
          },
          {
          $or : [
            { "creator.id": req.body.id },
            { "participant.id": req.body.id },
          ],
        },
        ],
      });
      if(findAlreadyExistsConversation.length > 0) {
        throw createError("Users already exists");
      }
      else {
        const result = await newConversation.save();
        res.status(200).json({
          message: "Conversation was added successfully!",
        });
      }
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            message: err.message,
          },
        },
      });
    }
  }
  
  // get messages of a conversation
  async function getMessages(req, res, next) {
    try {
      const messages = await Message.find({
        conversation_id: req.params.conversation_id,
      }).sort("-createdAt");
  
      const { participant } = await Conversation.findById(
        req.params.conversation_id
      );
  
      res.status(200).json({
        data: {
          messages: messages,
          participant,
        },
        user: req.user.userId,
        conversation_id: req.params.conversation_id,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            message: "Unknows error occured!",
          },
        },
      });
    }
  }
  
  // send new message
  async function sendMessage(req, res, next) {
    if (req.body.message || (req.files && req.files.length > 0)) {
      try {
        // save message text/attachment in database
        let attachments = null;
  
        if (req.files && req.files.length > 0) {
          attachments = [];
  
          req.files.forEach((file) => {
            attachments.push(file.filename);
          });
        }
  
        const newMessage = new Message({
          text: req.body.message,
          attachment: attachments,
          sender: {
            id: req.user.userId,
            name: req.user.username,
            profile_image: req.user.profile_image || null,
          },
          receiver: {
            id: req.body.receiverId,
            name: req.body.receiverName,
            profile_image: req.body.profile_image || null,
          },
          conversation_id: req.body.conversationId,
        });
  
        const result = await newMessage.save();
        // emit socket event
        global.io.emit("new_message", {
          message: {
            conversation_id: req.body.conversationId,
            sender: {
              id: req.user.userId,
              name: req.user.username,
              profile_image: req.user.profile_image || null,
            },
            message: req.body.message,
            attachment: attachments,
            date_time: result.date_time,
          },
        });
        // console.log(result);
        res.status(200).json({
          message: "Successful!",
          data: result,
        });
      } catch (err) {
        res.status(500).json({
          errors: {
            common: {
              message: err.message,
            },
          },
        });
      }
    } else {
      res.status(500).json({
        errors: {
          common: "message text or attachment is required!",
        },
      });
    }
  }

async function getRoom(req,res) {
  // console.log(req.param.roomId);
  res.render("room", { 
    roomId: req.params.room
  });
}

async function videoCall(req,res,next) {
  res.redirect(`/inbox/videoCall/${uuidV4()}`);
}

module.exports = {
    getInbox,
    searchUser,
    getMessages,
    addConversation,
    sendMessage,
    videoCall,
    getRoom,
    blockUser
};