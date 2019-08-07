const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("./auth-keys.js");
const userModel = require("./../models/user.js");
const logger = require("../config/logs-config.js");

/*Only storing user id and uath id in the session and no the whole user payload -IMP*/
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userModel.findById(id).then(user => {
    done(null, { id: user._id, authId: user.authId, userName: user.userName });
  });
});

/*Using google O-auth strategy for passport to check and insert incoming user*/
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: "/auth/google/cb"
    },
    (accessToken, refreshToken, profile, done) => {
      /*1.Check if user already exists*/
      userModel.findOne({ authId: profile.id }).then(currentUser => {
        if (currentUser) {
          logger.info(`logged in user is::${JSON.stringify(currentUser)}`);
          done(null, {
            id: currentUser._id,
            authId: currentUser.authId,
            userName: currentUser.userName
          });
        } else {
          /*2.if not then create new user*/
          new userModel({
            authId: profile.id,
            userName: profile.displayName
          })
            .save()
            .then(newUser => {
              logger.info(
                `new user created after sign-in::${JSON.stringify(newUser)}`
              );
              done(null, {
                id: newUser._id,
                authId: newUser.authId,
                userName: newUser.userName
              });
            });
        }
      });
    }
  )
);
