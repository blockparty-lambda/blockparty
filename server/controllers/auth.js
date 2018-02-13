const { requireSignIn, requireAuth } = require("../services/passport");
const getTokenForUser = require("../services/token");

const signIn = (req, res) => {
  console.log('inside signed in')
  res.send({ token: getTokenForUser(req.user) });
};

module.exports = { signIn, requireSignIn, requireAuth };
