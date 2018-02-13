const User = require("../models/user");
const ObjectId = require("mongodb").ObjectId; // somewhere we need to place the instantiation of the ObjectId function
const CoinController = require("./coin");

// console.log(CoinController);

const STATUS_USER_ERROR = 422;

const createUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await new User({ email, password, username }).save();
    return res.json({
      success: true,
      message: "Successfully created new user"
    });
  } catch (error) {
    return res
      .status(STATUS_USER_ERROR)
      .json({ success: false, message: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      message: `Successfully retrieved user: ${user.username}`,
      user
    });
  } catch (error) {
    return res.json({
      error: { success: false, message: "Something went wrong on the server" }
    });
  }
};

const getFriends = async (req, res) => {
  User.findOne({ _id: ObjectId(req.user.id) })
    .populate({ path: "friends", select: ["username", "avatarUrl", "_id"] })
    .exec()
    .then(results => res.json(results.friends))
    .catch(err => res.json(err));
};

const getWallets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    for (let i = 0; i < user.wallets.length; i++) {
      const wallet = user.wallets[i];
      const walletData = await CoinController.getWalletInfo(wallet.coinAbbr, wallet.address);

      user.wallets[i].balance = walletData.data.balance;
    }
    res.json({ succes: true, wallets: user.wallets });
  } catch (error) {
    res.json({ succes: false, message: error.message });
  }
};

const addFriend = (req, res) => {
  const { userId1, userId2 } = req.body;

  // add the second user (userId2) to first users (userId1) friend list
  User.findOneAndUpdate(
    { _id: ObjectId(userId1) },
    { $addToSet: { friends: ObjectId(userId2) } }
  )
    .then(() => {
      // add the first user (userId1) to second users (userId2) friend list
      User.findOneAndUpdate(
        { _id: ObjectId(userId2) },
        { $addToSet: { friends: ObjectId(userId1) } }
      )
        .then(() =>
          res.json({ success: true, message: "successfully added friend" })
        )
        .catch(err1 => res.json(err1));
    })
    .catch(err => res.json(err));
};

const removeFriend = (req, res) => {
  const { userId1, userId2 } = req.body;

  // remove the second user (userId2) from first users (userId1) friend list
  User.findOneAndUpdate(
    { _id: ObjectId(userId1) },
    { $pull: { friends: ObjectId(userId2) } }
  )
    .then(() => {
      // remove the first user (userId1) from second users (userId2) friend list
      User.findOneAndUpdate(
        { _id: ObjectId(userId2) },
        { $pull: { friends: ObjectId(userId1) } }
      )
        .then(() =>
          res.json({ success: true, message: "successfully removed friend" })
        )
        .catch(err1 => res.json(err1));
    })
    .catch(err => res.json(err));
};

module.exports = {
  createUser,
  getFriends,
  getWallets,
  addFriend,
  removeFriend,
  getUserInfo
};
