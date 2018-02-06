const userController = require("../controllers/user.js");
const authController = require("../controllers/auth");

module.exports = app => {
  app.route("/register").post(userController.createUser);
  app
    .route("/signin")
    .post(authController.requireSignIn, authController.signIn);

  // Route to test Auth, can be removed if needed
  app.route("/users").get(authController.requireAuth, userController.getUsers);
};
