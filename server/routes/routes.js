const userController = require("../controllers/user.js");
const authController = require("../controllers/auth");
const coinController = require("../controllers/coin");

module.exports = app => {
  app.route("/register").post(userController.createUser);
  app
    .route("/signin")
    .post(authController.requireSignIn, authController.signIn);

  app.route("/create-wallet/:coin").post(authController.requireAuth, coinController.createWallet);

  // Route to test Auth, can be removed if needed
  app.route("/users").get(authController.requireAuth, userController.getUsers);
};
