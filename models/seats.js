const mongoose = require('mongoose');
const seatSchema = new mongoose.Schema({
    seatNumber: {
      type:Number,
      max:0,
      required:true
    },
    row:{
        type:String,
        required:true
    }
  });

  const Seats = mongoose.model('Seats', seatSchema);

module.exports = Seats;