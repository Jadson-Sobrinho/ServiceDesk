const ticketModel = require("../models/ticket");

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find().populate('user_id', 'name');
        
        console.log(tickets); 
        res.json(tickets);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Faild to get all tickets (controller)"});
    }
};

exports.getUserTickets = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const userTickets = await ticketModel.find({user_id: user_id}).populate('user_id', 'name');
        res.json(userTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Faild to get user tickets (controller)"});
    }
};

exports.createTicket = async (req, res) => {
    try {
        const userId = req.user?.user_id;

        let {
            address,
            description,
            urgency_level

        } = req.body;

        const newTicket = new ticketModel({
            user_id: userId,
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