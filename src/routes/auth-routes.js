const router = require("express").Router();
const passport = require("passport");

/*only setting up authentication with google for now (/auth/provider)*/

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"]
  })
);

/*this callback route is required by google to redirect to and hand over to passport*/
router.get("/google/cb", passport.authenticate("google"), (req, res, next) => {
  res.redirect("/user/");
});

router.get("/logout", (req, res, next) => {
  req.logout();
  return res.send("You are logged out!");
});

/*
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"]
  })
);
*/
module.exports = router;
