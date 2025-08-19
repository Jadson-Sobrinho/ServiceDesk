const express = require('express');
const router = express.Router();
const ticketController = require("../controllers/ticket");
const auth = require("../controllers/auth");


router.get('/', ticketController.getAllTickets);

router.get('/user', auth.verifyToken, ticketController.getUserTickets);

router.post('/', auth.verifyToken, ticketController.createTicket);

module.exports = router;