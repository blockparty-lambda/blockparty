const User = require("../models/user");

const STATUS_USER_ERROR = 422;

const createUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const user = await new User({ email, password, username }).save();
    return res.json(user);
  } catch (error) {
    return res
      .status(STATUS_USER_ERROR)
      .json({ stack: error.stack, message: error.message });
  }
};

module.exports = {
  createUser
};
