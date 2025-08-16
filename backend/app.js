const express = require('express');
const app = express();
const cors = require('cors');

const ticketRoute = require("./api/routes/ticket");

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

app.use('/ticket', ticketRoute);

module.exports = app;