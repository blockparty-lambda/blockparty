const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const User = require("../models/user");

require("dotenv").config();

const localOptions = {
  usernameField: "username"
};

const localLogin = new LocalStrategy(
  localOptions,
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false);
      user.checkPassword(password, (err, isMatch) => {
        if (err) return done(err);
        if (!isMatch) return done(null, false);
        return done(null, user);
      });
    } catch (error) {
      return done(error);
    }
  }
);

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: process.env.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

passport.use(jwtLogin);
passport.use(localLogin);

module.exports = {
  requireAuth: passport.authenticate("jwt", { session: false }),
  requireSignIn: passport.authenticate("local", { session: false })
};
