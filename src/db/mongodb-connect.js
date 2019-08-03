/*This file will hold database connection and event listeners for that connection*/
const mongoose = require("mongoose");
const logger = require("./../config/logs-config.js");
const { mongoDbConf } = require("./../config/base-config.js");

mongoose.Promise = global.Promise;
mongoose.connect(mongoDbConf.uri, mongoDbConf.params);
const db = mongoose.connection;

db.on("connected", function() {
  logger.info(`Mongoose default connection open to::${mongoDbConf.uri}`);
});

db.on("error", function(error) {
  logger.error(`Mongoose default connection error::${error}`);
  /*cleanly exit the application*/
  process.exit(0);
});

db.on("disconnected", function() {
  logger.error(`Mongoose default connection disconnected`);
});

/*If node process ends close mongo connection*/
process.on("SIGINT", function() {
  db.close(function() {
    logger.error(
      `Mongoose default connection disconnected via app termination`
    );
    process.exit(0);
  });
});

/*load the models*/
require("./../models/video.js");
