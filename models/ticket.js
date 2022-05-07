
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movies' },
  showtime: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Showtime' }],
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qty: {
    type: Number,
    required: true,
    min: 0
  },
  seat: {
    type: Number,
    required: true,
    min: 0
  },
  row: {
    type: String,
    required: true

  },

});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;