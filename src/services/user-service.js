const ffmpeg = require("ffmpeg");
const logger = require("./../config/logs-config.js");
const fs = require("fs");
const userModel = require("./../models/user.js");

const uploadVideoSvc = async serviceParam => {
  try {
    const filePath = serviceParam.vidfile.path;
    /*1.resizing and storing the file with resolution*/
    let video = await new ffmpeg(filePath);
    const absFileName = "encd_" + serviceParam.vidfile.filename;
    await video
      .setVideoSize("640x640", true, true, "#000000")
      .save(`${serviceParam.vidfile.destination}/${absFileName}`);

    /*2.deleting the original file*/
    await fs.unlinkSync(filePath);

    /*3.storing the video details for the user in db*/
    const newVidDoc = {
      name: serviceParam.vidfile.originalname,
      creatorName: serviceParam.user.userName,
      uploadedAt: new Date(),
      fileLocation: serviceParam.vidfile.destination,
      fileAbsPath: serviceParam.vidfile.path,
      encodedName: absFileName
    };
    const query = userModel.updateOne(
      { _id: serviceParam.user.id },
      { $push: { uploadedVids: newVidDoc } }
    );
    const result = await query.exec();
    //logger.info(`video upload query result::${JSON.stringify(result)}`);
    return {
      isError: false,
      errMsg: null,
      payload: "success"
    };
  } catch (error) {
    logger.error(`At user-service:uploadVideoSvc():: ${JSON.stringify(error)}`);
    throw Error("An error happened uploading/processing file!");
  }
};

const getVideoByIdSvc = async serviceParam => {
  try {
    /*1.query with match on file id in array of sub-docs*/
    const query = userModel.find(
      {},
      { uploadedVids: { $elemMatch: { _id: serviceParam.vidId } } }
    );
    const result = await query.lean().exec();

    /*2.sending result back to controller with file details*/
    if (result.length > 0) {
      // logger.info(`file received getVideoByIdSvc()::${JSON.stringify(result)}`);
      return {
        isError: false,
        errMsg: null,
        payload: result[0]["uploadedVids"][0]
      };
    } else {
      throw Error("No file found with passed id for logged in user!");
    }
  } catch (error) {
    logger.error(
      `At user-service:getVideoByIdSvc():: ${JSON.stringify(error)}`
    );
    throw Error("An error happened uploading/processing file!");
  }
};

const getAllVideoListSvc = async serviceParam => {
  try {
    /*1.getting video list by logged in user id with pagination*/
    const pageNumber = parseInt(serviceParam["page"]);
    const pageSize = parseInt(serviceParam["limit"]);
    const offSet = (pageNumber - 1) * pageSize;

    /*sorting the quey so that pagination works*/
    const query = userModel
      .find()
      .sort({ uploadedAt: 1 })
      .distinct("uploadedVids");
    const result = await query.exec();

    /*2.formatting only required details fo uploaded videos and pagination*/
    let videos = result.map(v => {
      return {
        id: v._id,
        name: v.name,
        uploadedAt: v.uploadedAt,
        comments: v.comments
      };
    });
    videos = videos.slice(offSet, pageNumber * pageSize);

    /*3.sending result back to controller*/
    return {
      isError: false,
      errMsg: null,
      payload: videos
    };
  } catch (error) {
    logger.error(`At user-service:uploadVideoSvc():: ${JSON.stringify(error)}`);
    throw Error("An error happened getting video list!");
  }
};

const deleteVideoByIdSvc = async serviceParam => {
  try {
    const query = userModel.update(
      { _id: serviceParam.userId },
      { $pull: { uploadedVids: { _id: serviceParam.vidId } } }
    );
    const result = await query.exec();
    logger.info(`result at deleteVideoByIdSvc()::${JSON.stringify(result)}`);
    if (result.nModified !== 1) {
      return {
        isError: true,
        errMsg: "no video found for deletion with loggedin user & requested id",
        payload: []
      };
    } else {
      return {
        isError: false,
        errMsg: null,
        payload: "success"
      };
    }
  } catch (error) {
    logger.error(
      `At user-service:deleteVideoByIdSvc():: ${JSON.stringify(error)}`
    );
    throw Error("An error happened deleting the video!");
  }
};

const getVideoListByUserSvc = async serviceParam => {
  try {
    /*1.getting video list by any passed user id*/
    const pageNumber = parseInt(serviceParam["page"]);
    const pageSize = parseInt(serviceParam["limit"]);
    const offSet = (pageNumber - 1) * pageSize;

    const query = userModel.find(
      { _id: serviceParam.id },
      { uploadedVids: { $slice: [offSet, pageSize] } }
    );

    const result = await query.exec();
    logger.info(`result at getVideoListByUserSvc()::${JSON.stringify(result)}`);

    /*2.formatting only required details fo uploaded videos*/
    let videos = [];
    if (result && result[0].uploadedVids.length > 0) {
      let vid = result[0].uploadedVids.map(v => ({
        comments: v.comments,
        creatorName: v.creatorName,
        uploadedAt: v.uploadedAt,
        name: v.name
      }));
      videos.push(vid);
    } else {
      return {
        isError: false,
        errMsg: null,
        payload: "no more results found"
      };
    }

    /*3.sending result back to controller*/
    return {
      isError: false,
      errMsg: null,
      payload: [].concat.apply([], videos)
    };
  } catch (error) {
    logger.error(
      `At user-service:getVideoListByUserSvc():: ${JSON.stringify(error)}`
    );
    throw Error("An error happened getting the video list");
  }
};

const doCommentOnVideoSvc = async serviceParam => {
  /*2.finding and updating the video on which the comment is made*/
  const query = userModel.update(
    { "uploadedVids._id": serviceParam.videoId },
    {
      $push: {
        "uploadedVids.$.comments": {
          content: serviceParam.comment,
          creatorName: serviceParam.userName,
          createdAt: new Date()
        }
      }
    }
  );

  const result = await query.exec();
  return {
    isError: false,
    errMsg: null,
    payload: "success"
  };
};

const deleteCommentsSvc = async serviceParam => {
  const query = userModel.update(
    { "uploadedVids._id": serviceParam.vidId },
    {
      $pull: {
        "uploadedVids.$.comments": {
          _id: serviceParam.commentId,
          creatorName: serviceParam.userName
        }
      }
    }
  );
  const result = await query.exec();
  return {
    isError: false,
    errMsg: null,
    payload: "success"
  };
};

const getCommentsOfVideoSvc = async serviceParam => {
  try {
    /*1.getting video list by any passed user id*/
    const pageNumber = parseInt(serviceParam["page"]);
    const pageSize = parseInt(serviceParam["limit"]);
    const offSet = (pageNumber - 1) * pageSize;

    const query = userModel
      .find(
        {},
        {
          uploadedVids: {
            $elemMatch: { _id: serviceParam.id }
          }
        }
      )
      .lean();
    const result = await query.exec();
    let comments;
    if (result && result[0]["uploadedVids"].length !== 0) {
      comments = result[0]["uploadedVids"][0]["comments"].map(c => {
        return {
          content: c.content,
          creatorName: c.creatorName,
          createdAt: c.createdAt
        };
      });
    }
    comments = comments.splice(offSet, pageNumber * pageSize);
    return {
      isError: false,
      errMsg: null,
      payload: comments
    };
  } catch (error) {
    logger.error(
      `At user-service:getCommentsOfVideoSvc():: ${JSON.stringify(error)}`
    );
    throw Error("An error happened getting the comments list");
  }
};

module.exports = {
  uploadVideoSvc: uploadVideoSvc,
  getVideoByIdSvc: getVideoByIdSvc,
  getAllVideoListSvc: getAllVideoListSvc,
  deleteVideoByIdSvc: deleteVideoByIdSvc,
  getVideoListByUserSvc: getVideoListByUserSvc,
  doCommentOnVideoSvc: doCommentOnVideoSvc,
  deleteCommentsSvc: deleteCommentsSvc,
  getCommentsOfVideoSvc: getCommentsOfVideoSvc
};
