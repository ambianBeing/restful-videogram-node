/*This file contains the logger configurations and options*/
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;
const APP_ROOT = require("./base-config.js").appRoot;

const LOG_FORMAT = printf(
  info => `[${info.timestamp}]  ${info.level}: ${info.message}`
);

const LOG_OPTIONS = {
  console: {
    silent: process.env.NODE_ENV === "test",
    json: true,
    format: combine(colorize({ all: false }), LOG_FORMAT)
  },
  verboseDebug: {
    filename: `${APP_ROOT}/logs/debug.log`,
    level: "info",
    format: combine(LOG_FORMAT),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }
};

const LOGGER = createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    })
  ),
  transports: [
    new transports.Console(LOG_OPTIONS.console),
    new transports.File(LOG_OPTIONS.verboseDebug)
  ],
  exitOnError: false
});

LOGGER.stream = {
  write: function(message, encoding) {
    LOGGER.info(message);
  }
};

module.exports = LOGGER;
