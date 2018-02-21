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
const { decrypt } = require("../services/utils");

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
btc_test_tx('mgBDUdu3wLeN2fXBq9ZBvGNFAy8J2v8L4G','mveugejEYBv7PhFhdJ5quGhRQT36ZmmvPY', 300000)