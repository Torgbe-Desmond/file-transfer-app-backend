const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../../directory/model");
const File = require("../model");
const {
  deleteFileFromStorage,
} = require("../../../utils/FirebaseInteractions");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();

const deleteFile = expressAsyncHandler(async (req, res) => {
  const { fileIds, directoryId } = req.body;
  const user_id = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let filesToDelete = [];
    let filesToBeDeletedImmediately = [];

    for (const fileId of fileIds) {
      const fileExist = await File.findOne({ _id: fileId }).session(session);
      if (!fileExist) {
        continue;
      } else if (fileExist.shared === true) {
        filesToBeDeletedImmediately.push(fileId);
        continue;
      }

      const fileExisted = await File.findByIdAndDelete(fileId, { session });
      if (fileExisted) {
          if (!fileExisted.shared) {
            await deleteFileFromStorage(user_id, fileExisted.name);
          }
          filesToDelete.push(fileExisted._id);
      }
    }

    if (filesToBeDeletedImmediately && filesToBeDeletedImmediately.length > 0) {
      await File.deleteMany({
        _id: { $in: filesToBeDeletedImmediately },
      }).session(session);
    }

    const fileDirectory = await Directory.findById(directoryId).session(
      session
    );

    if (fileDirectory) {
      fileDirectory.files.pull(...filesToDelete, ...filesToBeDeletedImmediately);
      await fileDirectory.save({ session });
    }

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      `${fileIds.length} files deleted successfully`,
      filesToDelete
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

module.exports = deleteFile;
