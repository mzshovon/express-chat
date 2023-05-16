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
    console.log(newConversation, 'test');
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
  
// get messages of a conversation
async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort("-createdAt");

    let {participant} = await Conversation.findById(
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

// send new message
async function deleteMessages(req, res, next) {
  try {
    const conversation_id = req.body.conversation_id;
    const conversation = await Conversation.findOne({
      _id: conversation_id,
    });
    if ((conversation?.creator?.id ||  conversation?.participant?.id) == req.user.userId) {
      const deleteMessages = await Message.deleteMany(
        {conversation_id : conversation_id}
      );
      res.status(200).json({
        message: "Successfully Deleted!",
      });
    } else {
      res.status(401).json({
        errors: {
          common: {
            message: "Unauthorized User!",
          },
        },
      });
    } 
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

  // search user
async function blockUser(req, res, next) {
  const userId = req.body.participantId;
  const conversationId = req.body.conversationId;
  try {
    let userStatus = "";
      const conversation = await Conversation.findOne({_id : conversationId});
      const participantInfo = conversation.participant;
      // console.log(req.user);
      const uuserStatuspdatedBlockedUnblockedInfo = { 
        id : participantInfo.id,
        name : participantInfo.name,
        status : (participantInfo.status && participantInfo.status == "active") ? "blocked" : "active",
        blockedBy: req.user.userId
      }; // Set the document to be updated

      const updateConversationUser = await Conversation.findOneAndUpdate({_id : conversationId}, {$set: {
        participant : uuserStatuspdatedBlockedUnblockedInfo
      }});
      if(updateConversationUser) {
        res.status(200).json({
          message : `User status ${userStatus} updated successfully`
        })
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
async function getRoom(req,res) {
  const urlParamElements = req.params.room.split("!");
  const callerId = urlParamElements[0];
  const conversationInfo = await Conversation.findOne({_id : urlParamElements[2].split(".")[1]});
  global.io.emit("video_call_request", {
    videoRecieverInfo : {
      callerId : conversationInfo.creator.id == callerId ? callerId : conversationInfo.participant.id,
      receiverId : conversationInfo.creator.id == callerId ? conversationInfo.participant.id : conversationInfo.creator.id,
      callerInfo : conversationInfo.creator.id == callerId ? conversationInfo.creator : conversationInfo.participant,
      redirectUrl : req.params.room,
    }
    });

  res.render("room", { 
    roomId: req.params.room
  });
}

async function getAudioRoom(req,res) {
  const urlParamElements = req.params.room.split("!");
  const callerId = urlParamElements[0];
  const conversationInfo = await Conversation.findOne({_id : urlParamElements[2].split(".")[1]});
  global.io.emit("audio_call_request", {
    videoRecieverInfo : {
      callerId : conversationInfo.creator.id == callerId ? callerId : conversationInfo.participant.id,
      receiverId : conversationInfo.creator.id == callerId ? conversationInfo.participant.id : conversationInfo.creator.id,
      callerInfo : conversationInfo.creator.id == callerId ? conversationInfo.creator : conversationInfo.participant,
      redirectUrl : req.params.room,
    }
    });

  res.render("audioRoom", { 
    roomId: req.params.room
  });
}

async function videoCall(req,res,next) {
  res.redirect(`/inbox/videoCall/${uuidV4()}`);
}

async function audioCall(req,res,next) {
  res.redirect(`/inbox/audioCall/${uuidV4()}`);
  // res.render('audioRoom');
}

module.exports = {
    getInbox,
    searchUser,
    getMessages,
    addConversation,
    sendMessage,
    deleteMessages,
    blockUser,
    videoCall,
    audioCall,
    getRoom,
    getAudioRoom
};