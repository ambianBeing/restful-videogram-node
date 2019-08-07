const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { videoUploadPath } = require("./base-config.js");

/*setup multer for video storage*/
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, videoUploadPath);
  },
  filename: function(req, file, cb) {
    crypto.pseudoRandomBytes(16, function(err, raw) {
      if (err) return cb(err);
      cb(
        null,
        raw.toString("hex") + Date.now() + path.extname(file.originalname)
      );
    });
  }
});

/*input file with multer is understood by name attribute -IMP*/
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4") {
      return cb(new Error("Only mp4 files are allowed"));
    }
    cb(null, true);
  }
}).single("userVideo");

module.exports = upload;
