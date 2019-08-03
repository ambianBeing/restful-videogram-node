const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const authRoutes = require("./routes/auth-routes.js");
const profileRoutes = require("./routes/profile-routes.js");
const logger = require("./config/logs-config.js");
const { serverPort, morganConf, corsConf } = require("./config/base-config.js");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(morganConf.customFacade, { stream: logger.stream }));
app.use(cors(corsConf));

/*Only use compression if response payloads are large*/
app.use(compression());

/*setup routes*/
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

/*home routes*/
app.get("/", (req, res) => {
  res.json({ error: null, response: "Hello from home" });
});

/*After routes establish db connection*/
require("./db/mongodb-connect.js");

/*establish the server on a listening port*/
app.listen(serverPort, function() {
  logger.info(`Enviroment::${process.env.NODE_ENV}`);
  logger.info(`restful-videogram-node listening on port::${serverPort}`);
});
