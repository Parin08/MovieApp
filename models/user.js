
const mongoose = require('mongoose');
const passportMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        reuired: true
    },
    lastName: {
        type: String,
        reuired: true
    }

});

userSchema.plugin(passportMongoose);

const user = new mongoose.model('User', userSchema);

module.exports = user;