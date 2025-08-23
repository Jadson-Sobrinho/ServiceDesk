const express = require('express');
const router = express.Router();
const ticketController = require("../controllers/ticket");
const auth = require("../controllers/auth");


router.get('/', ticketController.getAllTickets);

router.get('/user', auth.verifyToken, ticketController.getUserTickets);

router.get('/:id', ticketController.getTicketById);

router.post('/', auth.verifyToken, ticketController.createTicket);

router.patch('/status', auth.verifyToken, ticketController.UpdateTicketStatus);

module.exports = router;