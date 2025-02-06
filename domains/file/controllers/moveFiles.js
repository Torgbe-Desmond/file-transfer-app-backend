const expressAsyncHandler = require("express-async-handler");
const File = require("../model");
const NotFound = require("../../../Errors/Notfound");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const Handler = new ErrorHandler();
const { default: mongoose } = require("mongoose");
const Directory = require("../../directory/model");
const { StatusCodes } = require("http-status-codes");
const SuccessResponse = require("../../../utils/successResponse");

const moveFiles = expressAsyncHandler(async (req, res) => {
  const { DirectoriesToMoveFileTo, FileIds, DirectoryFileIsMoveFrom } =
    req.body;
  const _id = DirectoryFileIsMoveFrom;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sourceDirectory = await Directory.findById(_id).session(session);

    if (!sourceDirectory) {
      throw new NotFound(
        `Source directory with ID ${_id} does not exist`,
        true
      );
    }

    let data = [];
    let filesNotInTheDatabase = []
    // const targetDirectories = await File.find({ _id: { $in: DirectoriesToMoveFileTo } }).session(session);


    for (const targetId of DirectoriesToMoveFileTo) {
      const targetDirectory = await Directory.findById(targetId);
      if (!targetDirectory) {
        throw new NotFound(
          `Target directory with ID ${targetId} does not exist`,
          true
        );
      }

      for (const fileId of FileIds) {
        const file = await File.findById(fileId);

        if (!file) {
          filesNotInTheDatabase.push(fileId)
          continue;
        }

        sourceDirectory.files.pull(fileId);
        targetDirectory.files.push(fileId);
        data.push(file._id.toString());
        file.directoryId = targetId;
        await file.save({ session });
      }

      await targetDirectory.save({ session });
    }

    await sourceDirectory.save({ session });

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      "File(s) moved Succesfully",
      data
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

module.exports = moveFiles;
