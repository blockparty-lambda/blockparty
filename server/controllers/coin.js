const ObjectId = require("mongodb").ObjectId;
const bitcore = require("bitcore-lib");
const Insight = require("bitcore-explorers").Insight;
const unit = bitcore.Unit;
const { providers, utils, Wallet, _SigningKey } = require("ethers");
const keythereum = require("keythereum");
const { encrypt, decrypt } = require("../services/utils");
const User = require("../models/user");
const RequestFunds = require("../models/fundRequest");
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

  // add coins to test address from faucet function
  // create a fake user that holds your test coins
  const faucetUser = {
    wallets: [
      {
        coinAbbr: "btc_test",
        address: "mveugejEYBv7PhFhdJ5quGhRQT36ZmmvPY",
        privateKey:
          "6fa49d04227962e0556c21766dfac02ac0ccca09b1d7e1b01868e48112368326f7885f02961e35060921bb766be9276baf02b87c54aac198f1cac3b9b4945860"
      }
    ]
  };
  sendBtcTest(faucetUser, coinObj.address, 0.002, "test donation");

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
    const insight = new Insight("testnet");

    return new Promise((resolve, reject) => {
      return insight.address(address, (err, resp) => {
        if (err) return reject({ success: false, error });

        let dataObj = {};
        dataObj.balance = unit.fromSatoshis(resp.balance).toBTC();
        // other data we can have access to, if need be
        // dataObj.totalRecieved = unit.fromSatoshis(resp.totalRecieved).toBTC();
        // dataObj.unconfirmedBalance = unit.fromSatoshis(resp.unconfirmedBalance).toBTC();
        // dataObj.totalSent = unit.fromSatoshis(resp.totalSent).toBTC();
        dataObj.transactionIds = resp.transactionIds;

        return resolve({ data: dataObj });
      });
    });
  } else if (coin === "btc") {
    const result = await axios.get(
      `https://api.blocktrail.com/v1/btc/address/${address}?api_key=${
        process.env.blocktrail_API_key
      }`
    );
    result.data.balance = result.data.balance / 100000000;
    return result;
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

const coinToFiat = async (wallet, fiat) => {
  const coinMap = {
    btc: "bitcoin",
    btc_test: "bitcoin",
    eth: "ethereum",
    eth_test: "ethereum"
  };

  let resp = await axios.get(
    `https://api.coinmarketcap.com/v1/ticker/${coinMap[wallet.coinAbbr]}`
  );
  const coinValue = resp.data[0].price_usd;
  const userCoinVal = coinValue * wallet.balance;
  return userCoinVal.toFixed(2); // toFixed() is a rounding method
};

const sendBtc = (user, address, amount, subject) => {};

const sendBtcTest = (user, toAddress, amount, subject) => {
  const insight = new Insight("testnet");

  // Get wallet
  const wallet = user.wallets.find(w => w.coinAbbr === "btc_test");
  if (!wallet) {
    return { success: false, message: "No BTC_TEST wallet found!" };
  }

  const fromAddress = wallet.address;
  const privateKeyEncrypted = wallet.privateKey;
  const privateKeyDecrypted = decrypt(
    privateKeyEncrypted,
    "aes-256-ctr",
    process.env.salt
  );

  return new Promise((resolve, reject) => {
    return insight.getUnspentUtxos(fromAddress, (error, utxos) => {
      if (error) {
        return reject({ success: false, error });
      } else {
        let tx = bitcore.Transaction();
        tx.from(utxos);

        // const balance = euros.reduce((total, amount) => total + amount);
        // could use a reduce function
        let userSatoshiBalance = 0;
        for (var i = 0; i < utxos.length; i++) {
          userSatoshiBalance += utxos[i]["satoshis"];
        }
        const userNormalBalance = unit.fromSatoshis(userSatoshiBalance).toBTC();

        let amountToSendSatoshis = unit.fromBTC(amount).toSatoshis();

        if (userNormalBalance < amountToSendSatoshis) {
          return reject({ success: false, error: "insufficient funds" });
        }

        tx.to(toAddress, amountToSendSatoshis);
        tx.change(fromAddress);
        // tx.fee(5000);
        tx.sign(privateKeyDecrypted);
        tx.serialize();

        insight.broadcast(tx.toString(), function(error, returnedTxId) {
          if (error) {
            return reject({ success: false, error });
          } else {
            return resolve({ success: true, txId: returnedTxId });
          }
        });
      }
    });
  });
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
  try {
    // code to determine if sendTransaction is being called when the users directly sends
    // or sends due to a request of funds
    let coin,
      toAddress,
      amount,
      subject = "";

    // if coming from a request of funds
    if (req.body.rofId) {
      // set up parameters for executing a transaction
      const rofObj = await RequestFunds.findById(req.body.rofId);
      coin = rofObj.coin;
      amount = rofObj.amount;
      // toAddress is the senders wallet address
      const sender = await User.findById(ObjectId(rofObj.sender));
      toAddress = sender.wallets.find(w => w.coinAbbr === coin).address;
    } else {
      // else request is coming from a normal send transaction
      coin = req.body.coin;
      friendId = req.body.friendId;
      amount = req.body.amount;
      subject = req.body.subject;

      // Check if friend has wallet for given coin
      // return error if they do not
      const friend = await User.findById(ObjectId(friendId));
      toAddress = friend.wallets.find(w => w.coinAbbr === coin).address;

      if (!toAddress) {
        return res.json({
          success: false,
          message: `Friend doesn't have ${coin} wallet.`
        });
      }
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
        result = await sendEth(req.user, toAddress, amount.toString(), subject);
        break;
      case "eth_test":
        result = await sendEthTest(
          req.user,
          toAddress,
          amount.toString(),
          subject
        );
        break;
      default:
        // throw error of invalid coin
        res.json({
          success: false,
          message: "please provide valid coin in url parameters"
        });
    }

    // if its from a request of funds, remove the rof mongo obj if the transaction was success
    if (req.body.rofId) {
      // this piece of code is a candidate for DRY, its also used acceptFundRequest() in user.js controller
      RequestFunds.findByIdAndRemove(req.body.rofId)
        .then(rofObj => {
          if (rofObj) {
            res.json(result);
          } else
            // else res.json({ success: false, message: "no request of funds object found" });
            res.json(result);
        })
        .catch(err => {
          res.json({ success: false, message: err });
        });
    } else res.json(result);
  } catch (error) {
    res.json({ success: false, error });
  }
};

module.exports = { createWallet, getWalletInfo, coinToFiat, sendTransaction };
