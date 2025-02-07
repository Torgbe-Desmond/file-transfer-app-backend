const { default: mongoose } = require("mongoose");
const Directory = require("../../directory/model");
const NotFound = require("../../../Errors/Notfound");
const { StatusCodes } = require("http-status-codes");
const getDirectoryTree = require("../../../utils/getDirectoryTree");
const {
  deleteDirectoryTree,
} = require("../../../utils/deleteDirectoryRecursive");
const {
  deleteFileFromStorage,
} = require("../../../utils/FirebaseInteractions");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const asyncHandler = require("express-async-handler");
const Handler = new ErrorHandler();
const SuccessResponse = require("../../../utils/successResponse");


const deleteUser = asyncHandler(async (req, res) => {
  const user_id = req.user;
  const parentDirectory = req.params.reference_Id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExist = await User.findById(user_id);

    if (!userExist) {
      throw new NotFound("User not found.", true);
    }

    const mainDirectories = await Directory.find({ parentDirectory });

    if (mainDirectories.length === 0) {
      throw new NotFound("No directories found for the user.", true);
    }

    let directoryIds = mainDirectories.map((dir) => dir._id);

    let rootDirectoriesInParentDirectory = [];
    let deletedFiles = [];

    for (const directoryId of directoryIds) {
      console.info("Deletiong started..");
      const directoryExist = await Directory.findById(directoryId);

      if (!directoryExist) {
        throw new NotFound(`Directory with ID ${directoryId} not found.`, true);
      }

      const directoryTreeObject = await getDirectoryTree(
        directoryExist._id,
        session
      );

      if (directoryTreeObject) {
        const parentDir = directoryTreeObject.directoriesToDelete.shift();
        rootDirectoriesInParentDirectory.push(parentDir);

        const deletedResults = await deleteDirectoryTree(
          directoryTreeObject,
          session
        );
        deletedFiles.push(...deletedResults);
      }

      const { directoriesToDelete, filesToDelete } = directoryTreeObject;

      if (directoriesToDelete.length > 0) {
        directoryExist.subDirectories.pull(...directoriesToDelete);
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

    Directory.deleteMany(
      { _id: { $in: rootDirectoriesInParentDirectory } },
      { session }
    );

    await User.findByIdAndDelete(user_id);

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      "Account was deleted succesfully",
      null
    );

    res
      .status(StatusCodes.OK)
      .json(responsObject);
      
  } catch (error) {
    session.abortTransaction();
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = deleteUser;
