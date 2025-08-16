const express = require('express');
const app = express();

const ticketRoute = require("./api/routes/ticket");

app.use('/ticket', ticketRoute);

module.exports = app;