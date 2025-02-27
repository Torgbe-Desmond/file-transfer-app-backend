const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const getDirectoryTree = require("../../../utils/getDirectoryTree");
const {
  deleteDirectoryTree,
} = require("../../../utils/deleteDirectoryRecursive");
const {
  deleteFileFromStorage,
} = require("../../../utils/FirebaseInteractions");
const NotFound = require("../../../Errors/Notfound");
const SuccessResponse = require("../../../utils/successResponse");
const Handler = new ErrorHandler();

const deleteDirectory = expressAsyncHandler(async (req, res) => {
  const { directoryIds, parentDirectory } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parent = await Directory.findById(parentDirectory).session(session);
    if (!parent) {
      throw new NotFound("Parent directory not found.", true);
    }

    let rootDirectoriesInParentDirectory = [];
    let rootFilesInParentDirectory = [];
    let deletedFiles = [];

    for (const directoryId of directoryIds) {
      console.info("Deletion started..");
      const directoryExist = await Directory.findById(directoryId).session(
        session
      );
      if (!directoryExist) {
        throw new NotFound(`Directory with ID ${directoryId} not found.`, true);
      }

      const directoryTreeObject = await getDirectoryTree(
        directoryExist._id,
        session
      );

      console.log('directoryTreeObject',directoryTreeObject)

      if (directoryTreeObject) {
        const parentDir = directoryTreeObject.directoriesToDelete.shift();
        rootDirectoriesInParentDirectory.push(parentDir);
        rootFilesInParentDirectory.push(...directoryTreeObject.filesToDelete);

        const deletedResults = await deleteDirectoryTree(
          directoryTreeObject,
          session
        );
        deletedFiles.push(...deletedResults);
      }

      const { directoriesToDelete, filesToDelete } = directoryTreeObject;

      if (directoriesToDelete.length > 0) {
        directoryExist.subDirectories.push(...directoriesToDelete);
      }
      if (filesToDelete.length > 0) {
        directoryExist.files.pull(...filesToDelete);
      }

      await directoryExist.save({ session });
    }

    console.info("Done with schema deletion..");

    for (const { name, user_id } of deletedFiles) {
      await deleteFileFromStorage(user_id, name);
    }

    await Directory.deleteMany(
      { _id: { $in: rootDirectoriesInParentDirectory } },
      { session }
    );
    parent.subDirectories.pull(...rootDirectoriesInParentDirectory);
    parent.files.pull(...rootFilesInParentDirectory);

    await parent.save({ session });

    const data = [
      ...rootDirectoriesInParentDirectory,
      ...rootFilesInParentDirectory,
    ];

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      `${directoryIds.length} folders deleted successfully`,
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

module.exports = deleteDirectory