const express = require('express');
const app = express();
const cors = require('cors');

const ticketRoute = require("./api/routes/ticket");
const authRoute = require("./api/routes/auth");

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

app.use('/auth', authRoute);
app.use('/ticket', ticketRoute);

module.exports = app;