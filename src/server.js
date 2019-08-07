const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const authRoutes = require("./routes/auth-routes.js");
const userRoutes = require("./routes/user-routes.js");
const authSetup = require("./config/auth-setup.js");
const logger = require("./config/logs-config.js");
const cookieSession = require("cookie-session");
const cookieKey = require("./config/auth-keys.js").session.cookieKey;
const passport = require("passport");
const { serverPort, morganConf, corsConf } = require("./config/base-config.js");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(morganConf.customFacade, { stream: logger.stream }));
app.use(cors(corsConf));

/*Only use compression if response payloads are large*/
app.use(compression());

/*setup cookies config and session*/
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [cookieKey]
  })
);

/*intialize passport auth*/
app.use(passport.initialize());
app.use(passport.session());

/*setup routes*/
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

/*home route*/
app.get("/", (req, res) => {
  res.send("You are logged in. Can access all user APIs");
});

/*home route -Can test this to Upload file if UI needed*/
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

/*After routes establish db connection*/
require("./db/mongodb-connect.js");

/*establish the server on a listening port*/
app.listen(serverPort, function() {
  logger.info(`Enviroment::${process.env.NODE_ENV}`);
  logger.info(`restful-videogram-node listening on port::${serverPort}`);
});
