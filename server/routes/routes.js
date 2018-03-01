const userController = require("../controllers/user.js");
const authController = require("../controllers/auth");
const coinController = require("../controllers/coin");

module.exports = app => {
  app.route("/register").post(userController.createUser);

  app
    .route("/upload")
    .post(
      authController.requireAuth,
      userController.cloudinaryUpload.single("avatar"),
      userController.uploadAvatar
    );

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
  app
    .route("/addablewallets")
    .get(authController.requireAuth, userController.addableWallets);

  app
    .route("/user")
    .get(authController.requireAuth, userController.getUserInfo);
  app
    .route("/users")
    .get(authController.requireAuth, userController.getAllUsers);
  app
    .route("/partialusers")
    .get(authController.requireAuth, userController.getPartialUsers);

  app
    .route("/send")
    .post(authController.requireAuth, coinController.sendTransaction);

  app.route("/helloworld").get((req, res) => {
    res.send("haaayyy guurrrllll haaayyyy!");
  });
};
