const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    creator: {
      id: mongoose.Types.ObjectId,
      name: String,
      status: String,
      avatar: String,
      blockedBy : String
    },

    participant: {
      id: mongoose.Types.ObjectId,
      name: String,
      status: String,
      avatar: String,
      blockedBy : String
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;