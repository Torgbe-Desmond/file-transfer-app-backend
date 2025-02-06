const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const NotFound = require("../../../Errors/Notfound");
const BadRequest = require("../../../Errors/BadRequest");
const SuccessResponse = require("../../../utils/successResponse");
const Handler = new ErrorHandler();

module.exports.moveDirectories = expressAsyncHandler(async (req, res) => {
  const { directoriesToMove, directoryToMoveTo } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!Array.isArray(directoriesToMove) || directoriesToMove.length === 0) {
      throw new BadRequest("No directories specified to move.", true);
    }

    if (directoryToMoveTo.length !== 1) {
      throw new BadRequest(
        "There should be exactly one target directory to move the directories into.",
        true
      );
    }

    const targetDirectoryId = directoryToMoveTo[0];

    const targetDirectory = await Directory.findById(targetDirectoryId).session(
      session
    );
    if (!targetDirectory) {
      throw new NotFound("Target directory not found.", true);
    }

    const directories = await Directory.find({
      _id: { $in: directoriesToMove },
    }).session(session);
    if (directories.length !== directoriesToMove.length) {
      throw new NotFound(
        "One or more directories to move were not found.",
        true
      );
    }

    let data = [];

    for (const directory of directories) {
      await Directory.findOneAndUpdate(
        { _id: directory._id },
        { parentDirectory: targetDirectoryId },
        { session }
      );

      const parentDirectory = await Directory.findById(
        directory.parentDirectory
      );
      if (parentDirectory) {
        parentDirectory.subDirectories.pull(directory._id);
        await parentDirectory.save({ session });
      }

      data.push(directory._id);
    }

    targetDirectory.subDirectories.push(...data);
    await targetDirectory.save({ session });

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      "Folder(s) Moved Succesfully",
      data
    );

    res.status(StatusCodes.CREATED).json(responsObject);
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
