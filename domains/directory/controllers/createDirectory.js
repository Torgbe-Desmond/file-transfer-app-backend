const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const BadRequest = require("../../../Errors/BadRequest");
const NotFound = require("../../../Errors/Notfound");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();

const createDirectory = expressAsyncHandler(async (req, res) => {
  const user_id = req.user;
  const { name } = req.body;
  const { directoryId: parentDirectory } = req.params;

  if (!parentDirectory || !mongoose.Types.ObjectId.isValid(parentDirectory)) {
    throw new BadRequest("Invalid or missing parent directory ID", true);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const directoryExist = await Directory.findById(parentDirectory).session(session);
    if (!directoryExist) {
      throw new NotFound("Parent directory does not exist", true);
    }

    const existingDirectory = await Directory.findOne({
      name: name.toLowerCase(),
      parentDirectory,
      user_id,
    }).session(session);

    if (existingDirectory) {
      throw new BadRequest("A directory with the specified name already exists", true);
    }

    const [newDirectory] = await Directory.create(
      [
        {
          name,
          user_id,
          parentDirectory,
          status: true,
        },
      ],
      { session }
    );

    directoryExist.subDirectories.push(newDirectory._id);
    await directoryExist.save({ session });

    const directoryData = await Directory.findById(newDirectory._id).lean().session(session);
    await session.commitTransaction();

    res.status(StatusCodes.CREATED).json(
      new SuccessResponse(true, "Folder created successfully", directoryData)
    );
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

module.exports = createDirectory;
