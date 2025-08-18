const express = require("express");
const ticketModel = require("../models/ticket");

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find().populate('user_id', 'name');
        
        console.log(tickets); 
        res.json(tickets);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Faild to get all tickets (controller)"})
    }
};

exports.createTicket = async (req, res) => {
    try {
        const {
            user_id,
            address,
            description,
            urgency_level

        } = req.body;

        const newTicket = new ticketModel({
            user_id,
            address,
            description,
            urgency_level
        });

        const savedTicket = await newTicket.save();

        return res.status(201).json({message: "Ticket created successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Faild to create a new ticket"});
    }
};