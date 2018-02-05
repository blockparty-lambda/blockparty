const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    design considerations

    where to put the private key?
*/

const AddressSchema = new Schema({
    address: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    publicKey: {
        type: String,
        required: true
    }
})

const CoinSchema = new Schema({
    // name e.x. bitcoin coin, ether, zcash
    name: {
        type: String,
        required: true
    },
    // abbreviation for coin e.x. btc, eth, zec
    abbr: {
        type: String,
        required: true
    },
    address: {
        type: AddressSchema,
        required: true
    }
    // do we even need to store the balance since the balance will always be
    // recorded on the block chain
    // all we would have to do is do a get reqestion thru some 3rd party api
    // to get balance of an address
    // infact lots of meta data is stored on the blockchain e.g. date created, transaction history
    // balance: {
    //     type: Number,
    //     required: true,
    //     default: 0.0
    // },
})

module.exports = mongoose.model('Coin', CoinSchema);