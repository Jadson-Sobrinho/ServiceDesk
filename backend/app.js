const express = require('express');
const app = express();
const cors = require('cors');

const ticketRoute = require("./api/routes/ticket");
const authRoute = require("./api/routes/auth");
const registerRoute = require("./api/routes/register");
const chatRoute = require("./api/routes/chat");

app.use(cors({
    origin: "https://calldesk.vercel.app"
}));

app.use(express.json());

app.use('/register', registerRoute);
app.use('/auth', authRoute);
app.use('/ticket', ticketRoute);
app.use('/chat', chatRoute);

module.exports = app;