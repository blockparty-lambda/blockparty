const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test-blockparty-simple');

require("../server/models/user");
const User = mongoose.model('User');

const username = "squeel";
const password = "1234";
const email = "neil@gmial.com"


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

const addFriend = (user, friend) => {
	User.findOneAndUpdate({ username: user }, { $addToSet: { friends: friend }}, { new: true })
		.then(res => console.log(res))
		.catch(err => console.log(err))
}

const addCoin = (user, coin) => {
	// create coin wallet address
	// time being here is some fake output from a create a wallet function
	const fakeWalletAddr = 'abclkasdfhopi3noasn';
	const fakePrivateKey = 'dd209jwe092n301mkq';
	const fakePublicKey = '221incin2n0n3nusw';


	const coinAbbrs = {
									'bitcoin' : 'btc',
									'ether' : 'eth',
									'zcash' : 'zec',
								}

	const addressObj = {
		address: fakeWalletAddr,
		privateKey: fakePrivateKey,
		publicKey: fakePublicKey,
	};
	const newCoinObj = {
		name: coin,
		abbr: coinAbbrs[coin],
		address: addressObj
	}

	User.findOneAndUpdate({ username: user }, { $addToSet: { coins: newCoin }}, { new: true })
		.then(res => console.log(res))
		.catch(err => console.log(err))
}

// addFriend('squeel', 'bennybob')
// addCoin('squeel', 'ether')

// mongoose.connection.close()