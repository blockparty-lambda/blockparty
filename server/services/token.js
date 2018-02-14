const jwt = require("jwt-simple");
const moment = require("moment");

module.exports = user => {
  return jwt.encode(
    {
      sub: user.id,
      iat: moment().unix()
      // Commented out for dev purposes, at least until I get
      // refresh tokens working
      // exp: moment().add(30, 'minutes').unix()
    },
    process.env.secret
  );
};
