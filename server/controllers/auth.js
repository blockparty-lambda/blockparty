const { requireSignIn, requireAuth } = require("../services/passport");
const getTokenForUser = require("../services/token");

const signIn = (req, res) => {
  res.send({ token: getTokenForUser(req.user) });
};

module.exports = { signIn, requireSignIn, requireAuth };
