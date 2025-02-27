const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { default: mongoose } = require("mongoose");
const Directory = require("../model");
const NotFound = require("../../../Errors/Notfound");
const BadRequest = require("../../../Errors/BadRequest");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();

const renameDirectory = expressAsyncHandler(async (req, res) => {
  const { _id, name } = req.body;

  if (!_id || !name) {
    throw new BadRequest("Directory ID and new name must be provided.", true);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const directoryExist = await Directory.findById(_id);
    if (!directoryExist) {
      throw new NotFound("No such directory found.", true);
    }

    const nameExist = await Directory.findOne({ name });
    if (nameExist && nameExist._id.toString() !== _id) {
      throw new BadRequest("Name already exists.", true);
    }

    const updatedDirectory = await Directory.findByIdAndUpdate(
      _id,
      { name },
      { new: true, session }
    );

    if (!updatedDirectory) {
      throw new BadRequest("Failed to update directory name.", true);
    }

    const { _id: updatedId, name: updatedName } = updatedDirectory;
    const data = { _id: updatedId, name: updatedName };

    await session.commitTransaction();

    const responsObject = new SuccessResponse(
      true,
      "Folder renamed Succesfully",
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


module.exports = renameDirectory