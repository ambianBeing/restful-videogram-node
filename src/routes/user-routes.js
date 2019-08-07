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
      payload: []
    });
  }
};

/* router.get("/", authCheckMw, (req, res, next) => {
  res.sendFile(appRoot + "/index.html");
}); */

/*finds a video uploaded to system by video id -param:id (/get-video?id=xyz)*/
router.get("/get-video", authCheckMw, controller.getVideoById);

/*finds the video list in the system -param:{page,limit} (/get-video-list?page=x&limit=y)*/
router.get("/get-video-list", authCheckMw, controller.getAllVideoList);

/*finds list of videos uploaded to system by a user with pagingation -param:{id} (/get-user-videos?id=xyz&page=x&limit=y)*/
router.get("/get-user-videos", authCheckMw, controller.getVideoListByUser);

/*logged in user can get comments list of any video -param:{id} (/get-video-comments?id=xyz&page=x&limit=y)*/
router.get("/get-video-comments", controller.getCommentsOfVideo);

/*logged in user can upload a file of .mp4 -multer will take over upload and pass file into request -param input file with name=userVideo*/
router.post(
  "/upload-video",
  authCheckMw,
  (req, res, next) => {
    upload(req, res, err => {
      if (err) {
        /*A multer error occured -log it*/
        logger.error(`${err.stack}`);
        return res.status(400).send({
          isError: true,
          errMsg: "An error happened uploading/processing file!",
          payload: []
        });
      } else {
        next();
      }
    });
  },
  controller.uploadVideo
);

/*any user logged in the system can comment on any video -param:{id} and {content:xyz} in body (/comment-on-video/:id)*/
router.patch("/comment-on-video/:id", authCheckMw, controller.doCommentOnVideo);

/*logged in user of the system can delete any of their comments on videos -param: {videoId, commentId} in body (/delete-comments)*/
router.delete("/delete-comments", authCheckMw, controller.deleteComments);

/*delete video and comments of logged in user by requested id (/delete-video) with param {id:xyz} in body*/
router.delete("/delete-video", authCheckMw, controller.deleteVideoById);
module.exports = router;
