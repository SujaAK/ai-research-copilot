const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String, 
    },
    content: {
      type: String,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    papers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Paper",
      },
    ],
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatschema)