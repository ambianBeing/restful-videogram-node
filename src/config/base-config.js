const path = require("path");
const APP_ROOT = path.dirname(require.main.filename);
const VIDEO_UPLOAD_PATH = path.resolve(APP_ROOT, "./video-uploads");

const MONGODB_CONNECTION_CONF = {
  uri: "mongodb://localhost:27017/usersDb", //change this URL <mongodb://YOUR_MONGO_CONTAINER:EXPOSED_MONGO_PORT/DB_NAME> when dockerizing
  params: {
    useNewUrlParser: true,
    useFindAndModify: false,
    autoIndex: false,
    reconnectTries: 50,
    reconnectInterval: 5000,
    poolSize: 20,
    connectTimeoutMS: 10000
  }
};

const CORS_CONF = {
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-type", "Authorization"],
  maxAge: 600 //to cache options check request
};

const MORGAN_CONF = {
  apacheCommon: "common",
  apacheCombined: "combined",
  customFacade: function(tokens, req, res) {
    return [
      "REQ:" + tokens.method(req, res),
      "URL:" + tokens.url(req, res),
      "STATUS:" + tokens.status(req, res),
      "SIZE:" + tokens.res(req, res, "content-length"),
      "TIME:" + tokens["response-time"](req, res) + "ms"
    ].join(" ");
  }
};

const SERVER_BASE_PORT = 5000;

module.exports = {
  mongoDbConf: MONGODB_CONNECTION_CONF,
  corsConf: CORS_CONF,
  morganConf: MORGAN_CONF,
  serverPort: SERVER_BASE_PORT,
  appRoot: APP_ROOT,
  videoUploadPath: VIDEO_UPLOAD_PATH
};
