const { number } = require('joi');
const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    show: {
        type: String,
        required: true
    },
    screen: {
        type: String,
        required: true
    }

});

const Showtime = mongoose.model('Showtime', showtimeSchema);

module.exports = Showtime;