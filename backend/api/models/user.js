const mongoose = require("mongoose");

const userSchema = new mongoose.mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
    },
    hashed_password: {
        type: String,
        require: true
    },
    rule: {
        type: String,
        enum: ['admin', 'user'],
        require: true
    },
    phone_number: {
        type: String
    }
});

const user = mongoose.model('user', userSchema, 'user');

module.exports = user;