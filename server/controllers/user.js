const User = require("../models/user");
const ObjectId = require('mongodb').ObjectId;  // somewhere we need to place the instantiation of the ObjectId function

const STATUS_USER_ERROR = 422;

const createUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await new User({ email, password, username }).save();
    return res.json(user);
  } catch (error) {
    return res
      .status(STATUS_USER_ERROR)
      .json({ stack: error.stack, message: error.message });
  }
};

const addFriend = (req, res) => {
  const { userId1, userId2 } = req.body;
  
  // add the second user (userId2) to first users (userId1) friend list
  User.findOneAndUpdate({ _id: ObjectId(userId1) }, { $addToSet: { friends: ObjectId(userId2) } })
    .then(res => {
      // add the first user (userId1) to second users (userId2) friend list
      User.findOneAndUpdate({ _id: ObjectId(userId2) }, { $addToSet: { friends: ObjectId(userId1) } })
        .then(res1 => res.json({ message : "succes" }))
        .catch(err1 => res.json(err1))
    })
    .catch(err => res.json(err))
}

const removeFriend = (req, res) => {
  const { userId1, userId2 } = req.body;

  // remove the second user (userId2) from first users (userId1) friend list
  User.findOneAndUpdate({ _id: ObjectId(userId1) }, { $pull: { friends: ObjectId(userId2) } })
    .then(res => {
      // remove the first user (userId1) from second users (userId2) friend list
      User.findOneAndUpdate({ _id: ObjectId(userId2) }, { $pull: { friends: ObjectId(userId1) } })
        .then(res1 => res.json({ message: "success" }))
        .catch(err1 => res.json(err1))
    })
    .catch(err => res.json(err))
}

module.exports = {
  createUser,
  addFriend
};
