const ObjectId = require("mongodb").ObjectId;
const bitcore = require("bitcore-lib");
const Insight = require("bitcore-explorers").Insight;
const { providers, utils, Wallet, _SigningKey } = require("ethers");
const keythereum = require("keythereum");
const { encrypt, decrypt } = require("../services/utils");
const User = require("../models/user");
const axios = require("axios");

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

  // coin abbreviations
  const coinAbbr = {
    btc_test: "Bitcoin test",
    btc: "Bitcoin",
    eth_test: "Ether test",
    eth: "Ether",
    zec_test: "Zcash test",
    zec: "Zcash"
  };
  // instantiate a null wallet
  let wallet = {
    coin: coinAbbr[coin],
    coinAbbr: coin
  };

  // create wallet for coin
  switch (coin) {
    case "btc_test":
      wallet = Object.assign(wallet, createBTCTestWallet());
      break;
    case "btc":
      wallet = Object.assign(wallet, createBTCWallet());
      break;
    case "eth":
      wallet = Object.assign(wallet, createETHWallet());
      break;
    case "eth_test":
      wallet = Object.assign(wallet, createEthTestWallet());
      break;
    default:
      // throw error of invalid coin
      res.json({
        success: false,
        message: "please provide valid coin in url parameters"
      });
  }

  // hash the privateKey for the wallet
  wallet.privateKey = encrypt(
    wallet.privateKey,
    "aes-256-ctr",
    process.env.salt
  );

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

// helper function called in getwallets method for the getwallets api endpoint
const getWalletInfo = async (coin, address) => {
  if (coin === "btc_test") {
    return await axios.get(
      `https://api.blocktrail.com/v1/tbtc/address/${address}?api_key=${
        process.env.blocktrail_API_key
      }`
    );
  } else if (coin === "btc") {
    return await axios.get(
      `https://api.blocktrail.com/v1/btc/address/${address}?api_key=${
        process.env.blocktrail_API_key
      }`
    );
  } else if (coin === "eth") {
    const result = {
      data: {
        balance: 0
      }
    };
    const provider = new providers.InfuraProvider(
      providers.networks.homestead,
      process.env.infura_API_key
    );

    result.data.balance = parseFloat(
      utils.formatEther(await provider.getBalance(address))
    );
    return result;
  } else if (coin === "eth_test") {
    const result = {
      data: {
        balance: 0
      }
    };
    const provider = new providers.InfuraProvider(
      providers.networks.ropsten,
      process.env.infura_API_key
    );

    result.data.balance = parseFloat(
      utils.formatEther(await provider.getBalance(address))
    );
    return result;
  } else {
    return { success: true, error: "invalid coin given" };
  }
};

const sendBtc = (user, address, amount, subject) => {};

const sendBtcTest = (user, address, amount, subject) => {

  const insight = new Insight("testnet");

  // Get wallet
  const wallet = user.wallets.find(w => w.coinAbbr === "btc_test");
  if (!wallet) {
    return { success: false, message: "No BTC_TEST wallet found!" };
  }

  const addr = wallet.address;
  const privateKeyEncrypted = wallet.privateKey;
  const privateKeyDecrypted = decrypt(privateKeyEncrypted, "aes-256-ctr", process.env.salt);

  // create a new promise that resolves to either:
  // { success: false, error: <some error message> } or { success: true,  txId: <the txId> }
  // TODO: use the .toSathosis .fromSatoshis methods
  return new Promise((resolve, reject) => {

    return insight.getUnspentUtxos(addr, function (error, utxos) {
      if (error) return reject({ success: false, error });
      else {
        let tx = bitcore.Transaction();
        tx.from(utxos);
        tx.to(address, amount * 100000000);
        tx.change(wallet.address);
        // tx.fee(5000);
        tx.sign(privateKeyDecrypted);
        tx.serialize();

        insight.broadcast(tx.toString(), function (error, returnedTxId) {
          if (error) {
            return reject({ success: false, error });
          }
          else {
            return resolve({ success: true, txId: returnedTxId });
          };
        });
      };
    })
  })
};

const sendEth = async (user, address, amount, subject) => {
  // Get wallet
  const wallet = user.wallets.find(w => w.coinAbbr === "eth");
  if (!wallet) {
    return { success: false, message: "No ETH wallet found!" };
  }

  const provider = new providers.InfuraProvider(
    providers.networks.homestead,
    process.env.infura_API_key
  );

  const ethWallet = new Wallet(
    decrypt(wallet.privateKey, "aes-256-ctr", process.env.salt),
    provider
  );

  // Check balance for sufficient funds
  const ethBal = parseFloat(
    utils.formatEther(await provider.getBalance(ethWallet.address))
  );

  if (Number(amount) > ethBal) {
    return { success: false, message: "Insufficient funds." };
  }

  const ethAmount = utils.parseEther(amount);

  const transaction = await ethWallet.send(address, ethAmount);

  // TODO: Save transaction in DB.

  return { success: true, txId: transaction.hash };
};

const sendEthTest = async (user, address, amount, subject) => {
  // Get wallet
  const wallet = user.wallets.find(w => w.coinAbbr === "eth_test");
  if (!wallet) {
    return { success: false, message: "No ETH_TEST wallet found!" };
  }

  const provider = new providers.InfuraProvider(
    providers.networks.ropsten,
    process.env.infura_API_key
  );

  const ethWallet = new Wallet(
    decrypt(wallet.privateKey, "aes-256-ctr", process.env.salt),
    provider
  );

  // Check balance for sufficient funds
  const ethBal = parseFloat(
    utils.formatEther(await provider.getBalance(ethWallet.address))
  );

  if (Number(amount) > ethBal) {
    return { success: false, message: "Insufficient funds." };
  }

  const ethAmount = utils.parseEther(amount);

  const transaction = await ethWallet.send(address, ethAmount);

  // TODO: Save transaction in DB.

  return { success: true, txId: transaction.hash };
};

const sendTransaction = async (req, res) => {
  const { coin, friendId, amount, subject } = req.body;

  try {
    // Check if friend has wallet for given coin
    // return error if they do not
    const friend = await User.findById(ObjectId(friendId));
    const toAddress = friend.wallets.find(w => w.coinAbbr === coin).address;

    if (!toAddress) {
      return res.json({
        success: false,
        message: `Friend doesn't have ${coin} wallet.`
      });
    }

    let result = null;
    // Pass friend address to appropriate handler
    switch (coin) {
      case "btc_test":
        result = await sendBtcTest(req.user, toAddress, amount, subject);
        break;
      case "btc":
        result = await sendBtc(req.user, toAddress, amount, subject);
        break;
      case "eth":
        result = await sendEth(req.user, toAddress, amount, subject);
        break;
      case "eth_test":
        result = await sendEthTest(req.user, toAddress, amount, subject);
        break;
      default:
        // throw error of invalid coin
        res.json({
          success: false,
          message: "please provide valid coin in url parameters"
        });
    }
    res.json(result);
  } catch(error) {
    res.json({ success: false, error })
  }

};

module.exports = { createWallet, getWalletInfo, sendTransaction };
