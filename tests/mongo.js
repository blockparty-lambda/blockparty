const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const axios = require('axios');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/test-blockparty-references');
mongoose.connect('mongodb://localhost/blockparty');

require("../models/user");
const User = mongoose.model('User');

// mock user data
const username = "squeel";
const password = "1234";
const email = "neil@gmial.com"

const username1 = "steve";
const password1 = "mopar";
const email1 = "steve@msn.com"


const addUser = (username, password, email) => {
  const newUser = new User({
    username,
    password,
    email,
  })

  newUser.save()
    .then(doc => {
      console.log(doc);
    })
    .catch(err => console.log(err))
}

// adds two users to one anothers friends list
// takes in the users unique mongo object id
const addFriend = (userId1, userId2) => {

  // add the second user (userId2) to first users (userId1) friend list
  User.findOneAndUpdate({ _id: ObjectId(userId1) }, { $addToSet: { friends: ObjectId(userId2) } }, { new: true })
    .then(res => {
      // add the first user (userId1) to second users (userId2) friend list
      User.findOneAndUpdate({ _id: ObjectId(userId2) }, { $addToSet: { friends: ObjectId(userId1) } }, { new: true })
        .then(res1 => console.log(res1))
        .catch(err1 => console.log(err1))
    })
    .catch(err => console.log(err))
}

// takes in two userIds numbers
const removeFriend = (userId1, userId2) => {
  // add the second user (userId2) to first users (userId1) friend list
  User.findOneAndUpdate({ _id: ObjectId(userId1) }, { $pull: { friends: ObjectId(userId2) } }, { new: true })
    .then(res => {
      // add the first user (userId1) to second users (userId2) friend list
      User.findOneAndUpdate({ _id: ObjectId(userId2) }, { $pull: { friends: ObjectId(userId1) } }, { new: true })
        .then(res1 => console.log(res1))
        .catch(err1 => console.log(err1))
    })
    .catch(err => console.log(err))
}

const addCoin = (user, coin) => {
  // create coin wallet address
  // here is some fake output from a create a wallet function
  const fakeWalletAddr = 'abclkasdfhopi3noasn';
  const fakePrivateKey = 'dd209jwe092n301mkq';
  const fakePublicKey = '221incin2n0n3nusw';

  const coinAbbrs = { 'bitcoin': 'btc', 'ether': 'eth', 'zcash': 'zec' };

  const newCoinObj = {
    name: coin,
    abbr: coinAbbrs[coin],
    address: fakeWalletAddr,
    privateKey: fakePrivateKey,
    publicKey: fakePublicKey
  }

  User.findOneAndUpdate({ username: user }, { $addToSet: { coins: newCoinObj } }, { new: true })
    .then(res => console.log(res))
    .catch(err => console.log(err))
}

const getFriends = (userId) => {
  User.findOne({ _id: ObjectId(userId) })
    .populate({ path: 'friends', select: ['username', 'avatarUrl', '_id'] })
    .exec()
    .then(res => console.log(res.friends))
    .catch(err => console.log(err))
}

const getBTCTestWalletInfo = (address) => {
  axios.get(`https://api.blocktrail.com/v1/tbtc/address/${address}?api_key=${process.env.blocktrailKey}`)
    .then(result => console.log(result))
    .catch(err => console.log(err));
};

// addUser(username, password, email);
// addUser(username1, password1, email1);
// addFriend('5a78d32a0c1ef42ef014e2e6', '5a78d32a0c1ef42ef014e2e7')
// removeFriend('5a78d32a0c1ef42ef014e2e6', '5a78d32a0c1ef42ef014e2e7')
// addCoin('steve', 'ether')
// getFriends('5a7c918405b120596b32a916');
getBTCTestWalletInfo('mz8asbdAssiWgXdcYMxm1VUFihYxqx9Fcn')

// mongoose.connection.close()