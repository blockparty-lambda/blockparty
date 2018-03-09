const User = require("../models/user");
const RequestFunds = require("../models/fundRequest");
const Status = require("mongoose-friends").Status;
const multer = require("multer");
const multerCloudinary = require("multer-cloudinary");
const Cloudinary = require("cloudinary");
const ObjectId = require("mongodb").ObjectId; // somewhere we need to place the instantiation of the ObjectId function
const CoinController = require("./coin");
const { asyncForEach } = require("../services/utils");

const STATUS_USER_ERROR = 422;

Cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = multerCloudinary({
  cloudinary: { cloudinary: Cloudinary }
});
const cloudinaryUpload = multer({ storage: cloudinaryStorage });

const uploadAvatar = async (req, res) => {
  const avatarUrl = req.file.url;

  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { avatarUrl } });
    res.json({ success: true, message: "Updated profile picture" });
  } catch (error) {
    res.json({ success: false, message: "Something went wrong on the server" });
  }
};

const createUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await new User({
      email,
      password,
      username
    }).save();
    return res.json({
      success: true,
      message: "Successfully created new user"
    });
  } catch (error) {
    return res
      .status(STATUS_USER_ERROR)
      .json({ success: false, error: error.message });
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
  User.getFriends(
    req.user,
    {},
    { username: 1, avatarUrl: 1, _id: 1 },
    (err, fships) => {
      if (err) {
        return res.json({
          success: false,
          message: "Something went wrong on the server"
        });
      }

      res.json({ success: true, friends: fships });
    }
  );
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

      user.wallets[i].usdBalance = await CoinController.coinToFiat(wallet, "usd");
    }
    res.json({ success: true, wallets: user.wallets });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const addableWallets = async (req, res) => {
  const wallets = [
    {
      id: 1,
      coinAbbr: "eth_test",
      coin: "Ether Test"
    },
    {
      id: 2,
      coinAbbr: "eth",
      coin: "Ether"
    },
    {
      id: 3,
      coinAbbr: "btc",
      coin: "Bitcoin"
    },
    {
      id: 4,
      coinAbbr: "btc_test",
      coin: "Bitcoin Test"
    }
  ];

  await asyncForEach(req.user.wallets, w => {
    for (let i = 0; i < wallets.length; i++) {
      let walletObj = wallets[i];

      if (walletObj.coinAbbr === w.coinAbbr) {
        // remove from wallets
        wallets.splice(i, 1);
      }
    }
  });

  try {
    res.json({ success: true, wallets });
  } catch (error) {
    res.json({ success: false, error });
  }
};

const addFriend = async (req, res) => {
  const { friendId } = req.body;
  if (friendId === req.user.id) {
    return res.json({ success: false, message: "You can't friend yoursefl." });
  }
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

const getPartialUsers = (req, res) => {
  const { query } = req.query; //dav

  User.getFriends(req.user.id, {}, { _id: 1 }, async (err, friends) => {
    if (err) {
      return res.json({
        success: false,
        error
      });
    }
    try {
      const queriedUsers = await User.find({
        username: new RegExp(`^${query}`, "i")
      })
        .where('_id').ne(req.user.id)
        .where("_id")
        .nin(friends)
        .select("username avatarUrl _id");

      res.json({
        success: true,
        users: queriedUsers
      });
    } catch (error) {
      res.json({
        success: false,
        error
      });
    }
  });
};

const getRequestedFunds = (req, res) => {
  // get all users fund requests sent from friends and the users requests to their friends
  RequestFunds.find()
    .or([{ sender: req.user.id }, { receiver: req.user.id }])
    .populate({ path: 'sender', select: 'username' })
    .populate({ path: 'receiver', select: 'username' })
    .then(rofs => res.json(rofs))
    .catch(err => res.json(err))
}

const sendRequestedFunds = (req, res) => {
  const { coin, amount, receiver } = req.body;

  // create a new RequestFunds mongo object
  try {
    const newROF = new RequestFunds({ coin, amount, sender: req.user.id, receiver }).save();
    return res.json({
      success: true,
      message: "Successfully created a new funds request"
    });
  } catch (error) {
    return res
      .status(STATUS_USER_ERROR)
      .json({ success: false, error: error.message });
  }
}

const handleROF = (req, res) => {
  const { rofId, accepted } = req.body;

  if (accepted === false) {
    // DRY candidate, this code is also used in coin.js within the the sendTransaction method ~line 424
    RequestFunds.findByIdAndRemove(rofId)
      .then(rofObj => {
        if (rofObj) {
          res.json({
            success: true,
            message: "fund request successfully rejected",
            id: rofObj
          });
        }
        else res.json({ success: true, message: "no request of funds object found" });
      })
      .catch(err => {
        res.json({ success: false, message: err });
      })
  }
  else {
    // execute the transaction and remove the rof object from mongo
    // do transaction
    CoinController.sendTransaction(req, res);
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getFriends,
  getWallets,
  addableWallets,
  addFriend,
  removeFriend,
  getUserInfo,
  getPartialUsers,
  getRequestedFunds,
  sendRequestedFunds,
  handleROF,
  cloudinaryUpload,
  uploadAvatar
};
