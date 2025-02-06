const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const BadRequest = require("../../../Errors/BadRequest");
const NotFound = require("../../../Errors/Notfound"); 
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const SuccessResponse = require("../../../utils/successResponse");
const Handler = new ErrorHandler();

module.exports.createDirectory = expressAsyncHandler(async (req, res) => {
  const user_id = req.user;
  const { name } = req.body;
  const { directoryId: parentDirectory } = req.params;

  console.log("name:", name);
  console.log("user_id:", user_id);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!parentDirectory) {
      throw new BadRequest("Parent directory ID is required", true);
    }

    const directoryExist = await Directory.findById(parentDirectory).session(session);
    if (!directoryExist) {
      throw new NotFound("Parent directory does not exist", true);
    }

    const existingDirectory = await Directory.findOne({
      name: name.toLowerCase(),
      parentDirectory,
      user_id,
    }).setOptions({ session });

    if (existingDirectory) {
      throw new BadRequest("A directory with the specified name already exists", true);
    }

    const newDirectory = new Directory({ name, user_id, parentDirectory });
    await newDirectory.save({ session });

    directoryExist.subDirectories.push(newDirectory._id);
    await directoryExist.save({ session });

    await session.commitTransaction();

    const data = {
      _id: newDirectory._id,
      name: newDirectory.name,
      parentDirectory: newDirectory.parentDirectory,
      user_id: newDirectory.user_id,
      mimetype: newDirectory.mimetype,
      size: newDirectory.size,
      lastUpdated: newDirectory.lastUpdated,
    };

    const responseObject = new SuccessResponse(
      true,
      "Folder created Successfully",
      data
    );

    res.status(StatusCodes.CREATED).json(responseObject);
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
