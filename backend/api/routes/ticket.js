const express = require('express');
const router = express.Router();
const ticketController = require("../controllers/ticket");


router.get('/', ticketController.getAllTickets);

router.post('/', ticketController.createTicket);

module.exports = router;