const router = require("express").Router();
const controller = require("./../controllers/user-controller.js");
const upload = require("./../config/multer-setup.js");
const logger = require("./../config/logs-config.js");
const { appRoot } = require("./../config/base-config.js");

/*A middleware to check authentication for all routes of a user*/
const authCheckMw = (req, res, next) => {
  const currentUser = req.user;
  if (currentUser) {
    next();
  } else {
    /*user is not logged in -redirect to login or some page or send response object*/
    return res.status(400).send({
      isError: true,
      errMsg: "You are not logged in to access this URI!",
      payload: [],
    });
  }
};

/* router.get("/", authCheckMw, (req, res, next) => {
  res.sendFile(appRoot + "/index.html");
}); */

router.get("/get-video", authCheckMw, controller.getVideoById);

router.get("/get-video-list", authCheckMw, controller.getAllVideoList);

router.get("/get-user-videos", authCheckMw, controller.getVideoListByUser);

router.get("/get-video-comments", controller.getCommentsOfVideo);

router.post(
  "/upload-video",
  authCheckMw,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        /*A multer error occured -log it*/
        logger.error(`${err.stack}`);
        return res.status(400).send({
          isError: true,
          errMsg: "An error happened uploading/processing file!",
          payload: [],
        });
      } else {
        next();
      }
    });
  },
  controller.uploadVideo
);

router.patch("/comment-on-video/:id", authCheckMw, controller.doCommentOnVideo);

router.delete("/delete-comments", authCheckMw, controller.deleteComments);

router.delete("/delete-video", authCheckMw, controller.deleteVideoById);
module.exports = router;
