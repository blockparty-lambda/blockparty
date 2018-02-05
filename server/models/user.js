const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    a simple user schema with NOT using references e.x. reference to friends as other users
    or coins field references a coin schema
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