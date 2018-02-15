const User = require("../models/user");
const Status = require("mongoose-friends").Status;
const ObjectId = require("mongodb").ObjectId; // somewhere we need to place the instantiation of the ObjectId function
const CoinController = require("./coin");

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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ success: true, users });
  } catch (error) {
    return res.json({
      error: { success: false, message: "Something went wrong on the server" }
    });
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
  User.getFriends(req.user, (err, fships) => {
    if (err) {
      return res.json({
        success: false,
        message: "Something went wrong on the server"
      });
    }

    res.json({ success: true, friends: fships });
  });
};

const getWallets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    for (let i = 0; i < user.wallets.length; i++) {
      const wallet = user.wallets[i];
      const walletData = await CoinController.getWalletInfo(
        wallet.coinAbbr,
        wallet.address
      );

      user.wallets[i].balance = walletData.data.balance;
    }
    res.json({ success: true, wallets: user.wallets });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const addFriend = async (req, res) => {
  const { friendId } = req.body;
  const newFriend = await User.findById(friendId);
  User.requestFriend(req.user, newFriend, err => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Something went wrong on the server"
      });
    }
    res.json({ success: true, message: "Friend request sent" });
  });
};

const removeFriend = async (req, res) => {
  const { friendId } = req.body;

  const delFriend = await User.findById(friendId);

  User.removeFriend(req.user, delFriend, err => {
    if (err) {
      return res.json({
        success: false,
        message: "Something went wrong on the server"
      });
    }
    res.json({ success: true, message: "Friend removed" });
  });
};

const getPartialUsers = async (req, res) => {
  const query = req.query.query; //dav

  try {
    const queriedUsers = await User.find({ username: new RegExp(`^${query}`, "i") });

    // potential logic to remove a users friends from queriedUsers

    res.json({
      success: true,
      users: queriedUsers
    });
  } catch (error) {
    res.json({
      success: false,
      error
    })
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getFriends,
  getWallets,
  addFriend,
  removeFriend,
  getUserInfo,
  getPartialUsers
};
