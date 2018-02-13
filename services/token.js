const jwt = require("jwt-simple");
const moment = require("moment");

module.exports = user => {
  return jwt.encode(
    {
      sub: user.id,
      iat: moment().unix(),
      exp: moment().add(30, 'minutes').unix()
    },
    process.env.secret
  );
};
