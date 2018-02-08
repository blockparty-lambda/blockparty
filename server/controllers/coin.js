// import { ObjectId } from '../../../../Library/Caches/typescript/2.6/node_modules/@types/bson';
const ObjectId = require("mongodb").ObjectId;
const bitcore = require("bitcore-lib");
const { providers, utils, Wallet, _SigningKey } = require("ethers");
const keythereum = require("keythereum");
const { encrypt, decrypt } = require("../services/utils");
const User = require("../models/user");

// creates a testnet btc wallet and returns an object with its address, publicKey, and privateKey
// ********
// *URGENT*!!!! remember to hash the plain privateKey in the database!!!
// ********

// maybe move the create<coin>Wallet helpers somewhere else?
// or make them private methods?

// returns a btc test wallet with its public and private keys
const createBTCTestWallet = () => {
  let coinObj = {};

  const randBuffer = bitcore.crypto.Random.getRandomBuffer(32);
  const randNumber = bitcore.crypto.BN.fromBuffer(randBuffer);
  const privateKey = new bitcore.PrivateKey(randNumber, "testnet");
  const publicKey = privateKey.toPublicKey();
  const address = privateKey.toAddress();

  coinObj.privateKey = privateKey.toString();
  coinObj.publicKey = publicKey.toString();
  coinObj.address = address.toString();

  return coinObj;
};

// returns a btc wallet with its public and private keys
const createBTCWallet = () => {
  let coinObj = {};

  const randBuffer = bitcore.crypto.Random.getRandomBuffer(32);
  const randNumber = bitcore.crypto.BN.fromBuffer(randBuffer);
  const privateKey = new bitcore.PrivateKey(randNumber);
  const publicKey = privateKey.toPublicKey();
  const address = privateKey.toAddress();

  coinObj.privateKey = privateKey.toString();
  coinObj.publicKey = publicKey.toString();
  coinObj.address = address.toString();

  return coinObj;
};

// returns an ether test wallet with its public and private keys
const createEthTestWallet = () => {
  const coinObj = {};
  // Connect to Infura's hosted node on the Ropsten testnet, can be modified to have fallback providers in case
  // main provider is down.
  const provider = new providers.InfuraProvider(
    providers.networks.ropsten,
    process.env.infura_API_key
  );

  // Convert key to hex string so ethers.js create wallet can use it
  const key = keythereum.create().privateKey.toString("hex");

  const wallet = new Wallet("0x" + key, provider);

  coinObj.privateKey = wallet.privateKey;
  coinObj.publicKey = _SigningKey.getPublicKey(wallet.privateKey);
  coinObj.address = wallet.address;

  return coinObj;
};
// returns a ether wallet with its public and private keys
const createETHWallet = () => {
  const coinObj = {};

  const provider = new providers.InfuraProvider(
    providers.networks.homestead,
    process.env.infura_API_key
  );

  const key = keythereum.create().privateKey.toString("hex");

  const wallet = new Wallet("0x" + key, provider);

  coinObj.privateKey = wallet.privateKey;
  coinObj.publicKey = _SigningKey.getPublicKey(wallet.privateKey);
  coinObj.address = wallet.address;

  return coinObj;
};

// returns a z cash wallet with its public and private keys
const createZECWallet = () => {};

const createWallet = (req, res) => {
  const { coin } = req.params;

  // instantiate a null wallet
  let wallet;

  // create wallet for coin
  switch (coin) {
    case "btc_test":
      wallet = createBTCTestWallet();
      break;
    case "btc":
      wallet = createBTCWallet();
      break;
    case "eth":
      wallet = createETHWallet();
      break;
    case "eth_test":
      wallet = createEthTestWallet();
      break;
    default:
      // throw error of invalid coin
      res.json({
        success: false,
        message: "please provide valid coin in url parameters"
      });
  }

  // hash the privateKey for the wallet
  wallet.privateKey = encrypt(wallet.privateKey);

  // store coin in user document
  // TODO: do we want to check if the user has already has a coins wallet?
  //  this instance we do not check and assume they werent given an option
  User.findOneAndUpdate(
    { _id: ObjectId(req.user.id) },
    { $addToSet: { wallets: wallet } }
  )
    .then(result => res.json({ success: true, message: "wallet created!" }))
    .catch(err => res.json(err));
};

module.exports = { createWallet };
