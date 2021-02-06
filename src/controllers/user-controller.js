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
  getCommentsOfVideoSvc,
} = require("./../services/user-service.js");
const { checkForPositiveInt } = require("./../utils/common-util.js");

const getVideoById = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    const requestId = req.query.id;
    if (requestId && new ObjectId(requestId).toHexString() === requestId) {
      vaildationFlag = true;
    } else {
      errorStatus = 400;
      throw Error("request id is not a valid id");
    }

    if (vaildationFlag) {
      const result = await getVideoByIdSvc({
        userId: req.user.id,
        vidId: requestId,
      });

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
      payload: [],
    });
  }
};

const getAllVideoList = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
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

    if (vaildationFlag) {
      const result = await getAllVideoListSvc({
        page: req.query.page,
        limit: req.query.limit,
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:getVideoById()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
    });
  }
};

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

    if (vaildationFlag) {
      const result = await getVideoListByUserSvc({
        id: req.query.id,
        page: req.query.page,
        limit: req.query.limit,
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:uploadVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
    });
  }
};

const getCommentsOfVideo = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
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

    if (vaildationFlag) {
      const result = await getCommentsOfVideoSvc({
        id: req.query.id,
        page: req.query.page,
        limit: req.query.limit,
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:getCommentsOfVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
    });
  }
};

const uploadVideo = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
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

    if (vaildationFlag) {
      const serviceParam = {
        user: req.user,
        vidfile: req.file,
      };
      const result = await uploadVideoSvc(serviceParam);
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:uploadVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
    });
  }
};

const doCommentOnVideo = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
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
      const result = await doCommentOnVideoSvc({
        userName: req.user.userName,
        userId: req.user.id,
        videoId: param.id,
        comment: param.comment,
      });
      res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:doCommentOnVideo()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
    });
  }
};

const deleteComments = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
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
        userName: req.user.userName,
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:deleteComments()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
    });
  }
};

const deleteVideoById = async (req, res, next) => {
  let vaildationFlag = false;
  let errorStatus = null;
  try {
    const param = req.body;
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
        vidId: param.id,
      });
      return res.send(result);
    }
  } catch (error) {
    logger.error(`At user-controller:deleteVideoById()::${error}`);
    return res.status(errorStatus || 500).send({
      isError: true,
      errMsg: error.message,
      payload: [],
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
  deleteComments: deleteComments,
};
