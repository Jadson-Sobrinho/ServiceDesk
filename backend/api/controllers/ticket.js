const express = require("express");
const ticketModel = require("../models/ticket");

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find();
        
        console.log(tickets); 
        res.json(tickets);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Faild to get all tickets (controller)"})
    }
};