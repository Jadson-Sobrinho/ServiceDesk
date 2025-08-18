const express = require('express');
const router = express.Router();
const ticketController = require("../controllers/ticket");
const auth = require("../controllers/auth");


router.get('/', ticketController.getAllTickets);

router.post('/', ticketController.createTicket);

router.get('/user', auth.verifyToken, ticketController.getUserTickets);

module.exports = router;