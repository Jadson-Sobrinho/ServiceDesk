const mongoose = require("mongoose");


const ticketSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    address: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    urgency_level: {
        type: String,
        enum: ['Baixo', 'Médio', 'Alto', 'Crítico'],
        require: true
    },
    status: {
        type: String,
        enum: ['Em andamento', 'Concluída', 'Cancelada'],
        default: 'Em andamento',
        require: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const ticket = mongoose.model('ticket', ticketSchema, 'ticket');

module.exports = ticket;