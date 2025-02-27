const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const NotFound = require("../../../Errors/Notfound");
const {
  copyFileFromOneUserToAnother,
} = require("../../../utils/FirebaseInteractions");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();
const File = require('../../file/model')

const receiveSharedFiles = expressAsyncHandler(async (req, res) => {
  const { secreteCode } = req.body;
  const user = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const directoryExist = await Directory.findOne({
      name: "ReceivedFiles",
      user_id: user,
    });

    if (!directoryExist) {
      throw new NotFound("Directory not found.", true);
    }

    const sharedFilesExist = await Directory.findOne({
      secreteCode: secreteCode,
    }).populate("files");

    if (!sharedFilesExist) {
      throw new NotFound("Shared files not found, provide a valid secret", true);
    }

    let duplicatedFiles = [];

    for (const file of sharedFilesExist.files) {
      const fileExist = await File.findOne({
        _id: file._id,
        user_id: file.user_id,
      });

      if (!fileExist) continue;

      const fileUrl = await copyFileFromOneUserToAnother(
        file?.user_id,
        user,
        file?.name
      );

      duplicatedFiles.push({
        name: `${file.name}`,
        user_id: user,
        shared: false,
        url: fileUrl,
        mimetype: file.mimetype,
        directoryId: directoryExist._id,
        size: file.size,
      });
    }

    const createSharedFiles = await File.insertMany(duplicatedFiles, {
      session,
    });

    const sharedFilesIds = createSharedFiles.map((file) => file._id);

    directoryExist.files.push(...sharedFilesIds);

    await directoryExist.save({ session });

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      "Files received Succesfully",
       null,
    );

    res.status(StatusCodes.OK).json(responsObject);
  } catch (error) {
    await session.abortTransaction();
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = receiveSharedFiles ;
