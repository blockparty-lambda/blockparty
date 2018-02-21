const mongoose = require("mongoose");
const friends = require('mongoose-friends');
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

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
  wallets: {
    type: Array,
    required: true,
    default: []
  },
  avatarUrl : {
    type: String,
    required: true,
    default: "https://impactspace.com/images/uploads/person-default.png"
  }
});

UserSchema.plugin(friends());

UserSchema.pre("save", async function(next) {
  try {
    const hash = await bcrypt.hash(this.password, 11);
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.checkPassword = async function(password, cb) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return cb(null, isMatch);
  } catch (error) {
    return cb(error);
  }
};

module.exports = mongoose.model("User", UserSchema);
