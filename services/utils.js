// encrypt and decrypt functions for the private keys of the wallets
require("dotenv").config({ path: '../../.env' });
const crypto = require('crypto');
// const algorithm = 'aes-256-ctr';
// const salt = process.env.salt;

const encrypt = (text, algorithm, salt) => {
  const cipher = crypto.createCipher(algorithm, salt)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

const decrypt = (text, algorithm, salt) => {
  let decipher = crypto.createDecipher(algorithm, salt)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = { encrypt, decrypt };