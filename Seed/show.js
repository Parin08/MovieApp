const show = require('../models/Showtime');
const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/MovieApp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});


mongoose.connection.on('error', console.error.bind(console, 'connection error for database'));
mongoose.connection.once('open', function() {
   console.log('We are connected to database')
});


const show1 = new show({
    show:"10AM",
    screen:"6-A"
})

const show2 = new show({
    show:"8PM",
    screen:"6-B"
})
const show3 = new show({
    show:"1PM",
    screen:"3-A"
})

show1.save();
show2.save();
show3.save();