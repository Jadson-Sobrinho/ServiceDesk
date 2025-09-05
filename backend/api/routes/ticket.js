const express = require('express');
const router = express.Router();
const ticketController = require("../controllers/ticket");
const auth = require("../controllers/auth");


router.get('/', auth.verifyToken, ticketController.getAllTickets);

router.get('/user', auth.verifyToken, ticketController.getUserTickets);

router.get('/:id', auth.verifyToken, ticketController.getTicketById);

router.post('/', auth.verifyToken, ticketController.createTicket);

router.patch('/status', auth.verifyToken, ticketController.UpdateTicketStatus);

router.get('/teste', ticketController.getAllTickets);

module.exports = router;