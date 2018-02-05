const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require("./coin");
const Coin = mongoose.model('Coin');

/*

*/

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    friends: {
        type: Array,
        default: [],
        required: true
    },
    coins: {
        type: Array,
        required: true,
        default: []
    }
})

module.exports = mongoose.model('User', UserSchema);