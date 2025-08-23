const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    client: {
        id: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        email: { type: String }
  },
    support: {
        id: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        email: { type: String }
  },
    status: {
        type: String,
        enum: ["open", "in_progress", "closed"],
        default: "open"
  },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    closed_at: { 
        type: Date, 
        default: null 
    },
  messages: [
    {
      sender: {
        id: { type: mongoose.Schema.Types.ObjectId },
        rule: { 
            type: String, 
            enum: ["client", "support"] }
      },
      content: { 
        type: String, 
        required: true },
      created_at: { 
        type: Date, 
        default: Date.now }
    }
  ]

});

const chat = mongoose.model('chat', chatSchema, 'chat');

module.exports = chat;