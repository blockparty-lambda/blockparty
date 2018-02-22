const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const axios = require('axios');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blockparty');

require("../models/user");
const User = mongoose.model('User');

const bitcore = require("bitcore-lib");
// const explo = require("bitcore-explorers");
const Insight = require("bitcore-explorers").Insight;
const { encrypt, decrypt } = require("../services/utils");

// const insight = new explo.Insight();
const insight = new Insight("testnet");

const btc_test_tx = async (fromAddr, toAddr, amount) => {
  try {
    const user = await User.findById("5a7c918405b120596b32a916");
    // const user = await User.findOne({ "_id" : ObjectId(fromAddr), "wallets.coinAbbr" : "btc_test" });
    const addr = user.wallets[1].address;
    // console.log(addr);
    const privateKeyEncrypted = user.wallets[1].privateKey;
    // console.log(privateKeyEncrypted);
    const privateKeyDecrypted = decrypt(privateKeyEncrypted, "aes-256-ctr", process.env.salt);
    // console.log(privateKeyDecrypted);

    // Get Info about an address
    // insight.address(addr, (error, result) => console.log(`address ${result}`))
    // insight.address(addr, (error, result) => {
    //   if (error) console.log(error);
    //   else console.log(`address ${result}`);
    // })
    // insight.getUnspentUtxos(addr, (error, result) => console.log(`unspent utxos ${result}`))
    insight.getUnspentUtxos(addr, (error, utxos) => {
      if (error) console.log(error);
      else {
        // console.log(`utxos ${utxos}`);
        let tx = bitcore.Transaction();
        tx.from(utxos);
        tx.to(toAddr, amount);
        tx.change(fromAddr);
        tx.fee(5000);
        tx.sign(privateKeyDecrypted);

        // console.log('transaction');
        // console.log(tx.toObject());
        tx.serialize();

        // const scriptIn = bitcore.Script(tx.toObject().inputs[0].script);
        // console.log("input script string: ");
        // console.log(scriptIn.toString());
        // const scriptOut = bitcore.Script(tx.toObject().outputs[0].script);
        // console.log("output script string: ");
        // console.log(scriptOut.toString());

        insight.broadcast(tx.toString(), (err, returnedTxId) => {
          if (err) console.log(err);
          else console.log(`successful broadcast: ${returnedTxId}`);
        })
      };
    })
  } catch(err) {
    console.log(err);
  }

}

// squeel to frank
// btc_test_tx('mgBDUdu3wLeN2fXBq9ZBvGNFAy8J2v8L4G','mveugejEYBv7PhFhdJ5quGhRQT36ZmmvPY', 300000)

const sendBtcTest = (userId, address, amount, subject) => {

  // const user = await User.findById(userId);

  const insight = new Insight("testnet");

  // Get wallet
  const wallet = user.wallets.find(w => w.coinAbbr === "btc_test");
  if (!wallet) {
    return { success: false, message: "No ETH_TEST wallet found!" };
  }

  const addr = wallet.address;
  const privateKeyEncrypted = wallet.privateKey;
  const privateKeyDecrypted = decrypt(privateKeyEncrypted, "aes-256-ctr", process.env.salt);

  // const unspentUtxos = await Promise.promisify(insight.getUnspentUtxos(addr));

  // console.log(unspentUtxos);

  return new Promise((resolve, reject) => {

    insight.getUnspentUtxos(addr, function(error, utxos) {
      if (error) return reject({ success: false, error });
      else {
        let tx = bitcore.Transaction();
        tx.from(utxos);
        tx.to(address, amount * 100000000);
        tx.change(wallet.address);
        // tx.fee(5000);
        tx.sign(privateKeyDecrypted);
        tx.serialize();

        // console.log(utxos);
        // return resolve(utxos);

        insight.broadcast(tx.toString(), function(error, returnedTxId) {
          // if (err) res.json({ success: false, error: err });
          if (error) {
            console.log(`inside insight.broadcast ${error}`);
            return reject({ success: false, error });
          }
          else { 
            console.log(`inside insight.broadcast ${returnedTxId}`);
            return resolve({ success: true, txId: returnedTxId });
          };
        });
      };
    })
  })
}

const createTransaction = (transaction) => {
  return new Promise((resolve, reject) => {

    const unit = bitcore.Unit;
    const insight = new Insight("testnet");
    const minerFee = unit.fromMilis(0.128).toSatoshis(); //cost of transaction in satoshis (minerfee)
    const transactionAmount = unit.fromMilis(transaction.amount).toSatoshis(); //convert mBTC to Satoshis using bitcore unit

    // if (!bitcoinaddress.validate(transaction.fromaddress)) {
    //   return reject('Origin address checksum failed');
    // }
    // if (!bitcoinaddress.validate(transaction.toaddress)) {
    //   return reject('Recipient address checksum failed');
    // }

    insight.getUnspentUtxos(transaction.fromaddress, function (error, utxos) {
      if (error) {
        //any other error
        return reject(error);
      } else {

        if (utxos.length == 0) {
          //if no transactions have happened, there is no balance on the address.
          return reject("You don't have enough Satoshis to cover the miner fee.");
        }

        //get balance
        let balance = unit.fromSatoshis(0).toSatoshis();
        for (var i = 0; i < utxos.length; i++) {
          balance += unit.fromSatoshis(parseInt(utxos[i]['satoshis'])).toSatoshis();
        }

        //check whether the balance of the address covers the miner fee
        if ((balance - transactionAmount - minerFee) > 0) {

          //create a new transaction
          try {
            let bitcore_transaction = new bitcore.Transaction()
              .from(utxos)
              .to(transaction.toaddress, transactionAmount)
              .fee(minerFee)
              .change(transaction.fromaddress)
              .sign(transaction.privatekey);

            //handle serialization errors
            if (bitcore_transaction.getSerializationError()) {
              let error = bitcore_transaction.getSerializationError().message;
              switch (error) {
                case 'Some inputs have not been fully signed':
                  return reject('Please check your private key');
                  break;
                default:
                  return reject(error);
              }
            }

            // broadcast the transaction to the blockchain
            insight.broadcast(bitcore_transaction, function (error, body) {
              if (error) {
                reject('Error in broadcast: ' + error);
              } else {
                resolve({
                  transactionId: body
                });
              }
            });

          } catch (error) {
            return reject(error.message);
          }
        } else {
          return reject("You don't have enough Satoshis to cover the miner fee.");
        }
      }
    });
  });
}
const pkh = "3ff29001772632e2016b76226daa912cc2cd9f09b5ddbbe31e6eb38c18318070f0820903c44b3a555570b92239bf756aaf5eec2857ad909cf49b96e5bec55967";
const t = {
  fromaddress : "moeEhqEnKtjnZwCXRV3YFofKeh23KrZ46W",
  toaddress : "mveugejEYBv7PhFhdJ5quGhRQT36ZmmvPY",
  privatekey : decrypt(pkh, "aes-256-ctr", process.env.salt),
  amount : 0.01
}

// console.log(t)

// console.log(createTransaction(t));
console.log(sendBtcTest("5a85fc79a9f11674014767d0","mz8asbdAssiWgXdcYMxm1VUFihYxqx9Fcn",0.0001,""))
// sendBtcTest("5a7e2da3ac8d3161e2adbeb7","mveugejEYBv7PhFhdJ5quGhRQT36ZmmvPY",0.0001,"")