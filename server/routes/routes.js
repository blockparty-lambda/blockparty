const userController = require("../controllers/user.js");
const authController = require("../controllers/auth");
const coinController = require("../controllers/coin");

module.exports = app => {
  app.route("/register").post(userController.createUser);
  app
    .route("/signin")
    .post(authController.requireSignIn, authController.signIn);

  app
    .route("/create-wallet/:coin")
    .post(authController.requireAuth, coinController.createWallet);

  app
    .route("/addfriend")
    .post(authController.requireAuth, userController.addFriend);
  app
    .route("/removefriend")
    .post(authController.requireAuth, userController.removeFriend);
  app
    .route("/getfriends")
    .get(authController.requireAuth, userController.getFriends);
  app
    .route("/getwallets") // takes in <coin> and <address> params as query params
    .get(authController.requireAuth, userController.getWallets);
    
  // Route to test Auth, can be removed if needed
  app
    .route("/user")
    .get(authController.requireAuth, userController.getUserInfo);
};
