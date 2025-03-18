const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const NotFound = require("../../../Errors/Notfound");
const BadRequest = require("../../../Errors/BadRequest");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();

const moveDirectories = expressAsyncHandler(async (req, res) => {
  const { directoriesToMove, directoryToMoveTo } = req.body;

  if (!Array.isArray(directoriesToMove) || directoriesToMove.length === 0) {
    throw new BadRequest("No directories specified to move.", true);
  }

  if (!Array.isArray(directoryToMoveTo) || directoryToMoveTo.length !== 1) {
    throw new BadRequest(
      "There should be exactly one target directory to move the directories into.",
      true
    );
  }

  const targetDirectoryId = directoryToMoveTo[0];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const targetDirectory = await Directory.findById(targetDirectoryId).lean().session(session);
    if (!targetDirectory) {
      throw new NotFound("Target directory not found.", true);
    }

    const directories = await Directory.find({ _id: { $in: directoriesToMove } }).session(session);

    if (directories.length !== directoriesToMove.length) {
      throw new NotFound("One or more directories to move were not found.", true);
    }

    let movedData = [];

    for (const directory of directories) {
      await Directory.findByIdAndUpdate(directory._id, { parentDirectory: targetDirectoryId }, { session });

      if (directory.parentDirectory) {
        const parentDirectory = await Directory.findById(directory.parentDirectory).lean().session(session);
        if (parentDirectory) {
          parentDirectory.subDirectories.pull(directory._id);
          await parentDirectory.save({ session });
        }
      }

      movedData.push(directory._id);
    }

    targetDirectory.subDirectories = [...new Set([...targetDirectory.subDirectories, ...movedData])];
    await targetDirectory.save({ session });

    await session.commitTransaction();

    res.status(StatusCodes.CREATED).json(new SuccessResponse(true, "Folder(s) Moved Successfully", movedData));
  } catch (error) {
    await session.abortTransaction();
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Something went wrong." });
    }
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = moveDirectories;
