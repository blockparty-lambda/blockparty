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

// const getBTCTestWalletInfo = (address) => {
//   axios.get(`https://api.blocktrail.com/v1/tbtc/address/${address}?api_key=${process.env.blocktrailKey}`)
//     .then(result => console.log(result))
//     .catch(err => console.log(err));
// };

const getBTCTestWalletInfo = async (address) => {
  // axios.get(`https://api.blocktrail.com/v1/tbtc/address/${address}?api_key=${process.env.blocktrailKey}`)
  //   .then(result => console.log(result))
  //   .catch(err => console.log(err));
  try {
    const resp = await axios.get(`https://api.blocktrail.com/v1/tbtc/address/${address}?api_key=${process.env.blocktrailKey}`);
    return resp.data;
  } catch(err) {
    return err;
  }

};

// addUser(username, password, email);
// addUser(username1, password1, email1);
// addFriend('5a78d32a0c1ef42ef014e2e6', '5a78d32a0c1ef42ef014e2e7')
// removeFriend('5a78d32a0c1ef42ef014e2e6', '5a78d32a0c1ef42ef014e2e7')
// addCoin('steve', 'ether')
// getFriends('5a7c918405b120596b32a916');
// console.log(getBTCTestWalletInfo('mz8asbdAssiWgXdcYMxm1VUFihYxqx9Fcn'))

let stuff = [{x:null}, {x:null}]

stuff.map(i => {
  i.x = 5;
})


console.log(stuff)

// mongoose.connection.close()

  // ,
  // {
  //   "coin": "ethereum test",
  //   "coinAbbr": "eth_test",
  //   "privateKey": "6be89003277034e95638722e39fc9278c3cc9e5bb0d1e7b14e66e18012678970f5860902934939075726ef756bbd253cf205b87f02a8cb9afbccc4e2bfc25365e210",
  //   "publicKey": "0x0468bc8341df830d24a4e6f7b43ca936335011055a6ee8aef87500c8e08729cf0c5ebaa40d935ba1987e7689db63b903c6d5bfb629f90957d9d8a586dc53fdd8f5",
  //   "address": "0x0C0E246440df8b36E50087213Eaf7c40A8e545A1"
  // }