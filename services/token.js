const jwt = require("jwt-simple");

module.exports = user => {
  return jwt.encode(
    {
      sub: user.id,
      iat: new Date().getTime()
    },
    process.env.secret
  );
};
