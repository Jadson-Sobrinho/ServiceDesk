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
        enum: ['Aberto', 'Em andamento', 'Concluída', 'Cancelada'],
        default: 'Aberto',
        require: true
    },
    created_at: {
        type: String
    },
    created_at_log: {
        type: Date,
        default: Date.now
    }
});

ticketSchema.index({ user_id: 1 });

const ticket = mongoose.model('ticket', ticketSchema, 'ticket');

module.exports = ticket;