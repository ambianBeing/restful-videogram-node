/*controllers are meant to validate requests,handle response and call service*/
const logger = require("./../config/logs-config.js");
const ObjectId = require("mongoose").Types.ObjectId;
const {
  uploadVideoSvc,
  getVideoByIdSvc,
  getAllVideoListSvc,
  deleteVideoByIdSvc,
  getVideoListByUserSvc,
  doCommentOnVideoSvc,
  deleteCommentsSvc,
  getCommentsOfVideoSvc
} = require("./../services/user-service.js");
const { checkForPositiveInt } = require("./../utils/common-util.js");

/*finds a video uploaded to system by video id -param:id (/get-video?id=xyz)*/
const getVideoById = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.validate the id*/
    const requestId = req.query.id;
    if (requestId && new ObjectId(requestId).toHexString() === requestId) {
      vaildationFlag = true;
    } else {
      errorStatus = 400;
      throw Error("request id is not a valid id");
    }

    /*2.calling the service with the id and user*/
    if (vaildationFlag) {
      const result = await getVideoByIdSvc({
        userId: req.user.id,
        vidId: requestId
      });

      /*sending the video file for download throgh browser*/
      return res.download(
        result.payload.fileLocation + "/" + result.payload.encodedName,
        result.payload.name
      );
    } else {
      errorStatus = 400;
      throw Error("No id or invalid id receieved!");
    }
  } catch (error) {
    logger.error(`At user-controller:getVideoById()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

/*finds the video list of current logged in user -param:{page,limit} (/get-video-list?page=x&limit=y)*/
const getAllVideoList = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.validate the params passed*/
    if (req.query.limit && req.query.page) {
      vaildationFlag = true;
      if (
        !(
          checkForPositiveInt(req.query.limit) &&
          checkForPositiveInt(req.query.page)
        )
      ) {
        vaildationFlag = false;
        errorStatus = 400;
        throw Error(
          "page or limit in request params are not valid positve integers"
        );
      }
    } else {
      errorStatus = 400;
      throw Error("page or limit in request params missing");
    }

    /*2.user is logged in or not is checked in auth middleware -calling the service directly*/
    if (vaildationFlag) {
      const result = await getAllVideoListSvc({
        page: req.query.page,
        limit: req.query.limit
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:getVideoById()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

/*finds list of videos uploaded to system by a user with pagingation -param:{id} (/get-user-videos?id=xyz&page=x&limit=y)*/
const getVideoListByUser = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.validate the params passed*/
    if (
      req.query.id &&
      req.query.limit &&
      req.query.page &&
      new ObjectId(req.query.id).toHexString() === req.query.id
    ) {
      vaildationFlag = true;
      if (
        !(
          checkForPositiveInt(req.query.limit) &&
          checkForPositiveInt(req.query.page)
        )
      ) {
        vaildationFlag = false;
        errorStatus = 400;
        throw Error(
          "page or limit in request params are not valid positve integers"
        );
      }
    } else {
      errorStatus = 400;
      throw Error("request id is not a valid id");
    }

    /*2.calling the service with the file and user*/
    if (vaildationFlag) {
      const result = await getVideoListByUserSvc({
        id: req.query.id,
        page: req.query.page,
        limit: req.query.limit
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:uploadVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

/*logged in user can get comments list of any video -param:{id} (/get-video-comments?id=xyz&page=x&limit=y)*/
const getCommentsOfVideo = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.validate the params passed*/
    if (
      req.query.id &&
      req.query.limit &&
      req.query.page &&
      new ObjectId(req.query.id).toHexString() === req.query.id
    ) {
      vaildationFlag = true;
      if (
        !(
          checkForPositiveInt(req.query.limit) &&
          checkForPositiveInt(req.query.page)
        )
      ) {
        vaildationFlag = false;
        errorStatus = 400;
        throw Error(
          "page or limit in request params are not valid positve integers"
        );
      }
    } else {
      errorStatus = 400;
      throw Error("request id is not a valid id");
    }

    /*2.calling the service with the file and user*/
    if (vaildationFlag) {
      const result = await getCommentsOfVideoSvc({
        id: req.query.id,
        page: req.query.page,
        limit: req.query.limit
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:getCommentsOfVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

/*logged in user can upload a file of .mp4 -multer will take over upload and pass file into request*/
const uploadVideo = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.validate the file*/
    if (req.file) {
      vaildationFlag = true;
      logger.info(
        `File received at user-controller:uploadVideo()::${JSON.stringify(
          req.file
        )}`
      );
    } else {
      errorStatus = 400;
      throw Error("No file received!");
    }

    /*2.calling the service with the file and user*/
    if (vaildationFlag) {
      const serviceParam = {
        user: req.user,
        vidfile: req.file
      };
      const result = await uploadVideoSvc(serviceParam);
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:uploadVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

/*any user logged in the system can comment on any video -param:{id} and {content:xyz} in body (/comment-on-video/:id)*/
const doCommentOnVideo = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.Validating the params*/
    const param = req.params;
    param["comment"] = req.body.content;

    if (param.id && param["comment"]) {
      if (new ObjectId(param.id).toHexString() === param.id) {
        vaildationFlag = true;
      } else {
        errorStatus = 400;
        throw Error("video id is not a valid id");
      }
    } else {
      errorStatus = 400;
      throw Error("video id on request not found or comment is empty");
    }

    if (vaildationFlag) {
      /*2.We don't need logged in used id to find in db because userName is there in the session*/
      const result = await doCommentOnVideoSvc({
        userName: req.user.userName,
        userId: req.user.id,
        videoId: param.id,
        comment: param.comment
      });
      res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:doCommentOnVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};
const deleteComments = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    /*1.validating params in body*/
    const param = req.body;

    if (param && param.videoId && param.commentId) {
      vaildationFlag = true;
      if (
        !(
          new ObjectId(param.videoId).toHexString() === param.videoId &&
          new ObjectId(param.commentId).toHexString() === param.commentId
        )
      ) {
        vaildationFlag = false;
        errorStatus = 400;
        throw Error(
          "request parameters videoId or commentId is not a valid id"
        );
      }
    } else {
      errorStatus = 400;
      throw Error("request parameter format incorrect or one of id missing");
    }

    if (vaildationFlag) {
      const result = await deleteCommentsSvc({
        vidId: param.videoId,
        commentId: param.commentId,
        userId: req.user.id,
        userName: req.user.userName
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:deleteComments()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

/*delete video and comments of logged in user by requested id (/delete-video) with param {id:xyz} in body*/
const deleteVideoById = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    const param = req.body;
    /*1.validating params in body*/
    if (param && param.id) {
      vaildationFlag = true;
      if (!(new ObjectId(param.id).toHexString() === param.id)) {
        vaildationFlag = false;
        errorStatus = 400;
        throw Error("request parameter id is not a valid id");
      }
    } else {
      errorStatus = 400;
      throw Error("request parameter format incorrect or id missing");
    }

    if (vaildationFlag) {
      const result = await deleteVideoByIdSvc({
        userId: req.user.id,
        vidId: param.id
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:deleteVideoById()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: []
    });
  }
};

module.exports = {
  uploadVideo: uploadVideo,
  getVideoById: getVideoById,
  deleteVideoById: deleteVideoById,
  getAllVideoList: getAllVideoList,
  getVideoListByUser: getVideoListByUser,
  getCommentsOfVideo: getCommentsOfVideo,
  doCommentOnVideo: doCommentOnVideo,
  deleteComments: deleteComments
};
