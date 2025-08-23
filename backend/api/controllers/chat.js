const chatModel = require("../models/chat");

exports.createChat = async (req, res) => {
    try {
        const conversation = new chatModel(req.body);

        await conversation.save();

        res.status(201).json(conversation);
    } catch (error) {
        res.status(400).json({ error: err.message });
    }
};