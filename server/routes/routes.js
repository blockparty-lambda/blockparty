const userController = require("../controllers/user.js");

module.exports = app => {
  app.route("/register").post(userController.createUser);
};
