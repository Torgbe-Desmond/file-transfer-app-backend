const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const Directory = require("../model");
const NotFound = require("../../../Errors/Notfound");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();

const getAllDirForMoving = expressAsyncHandler(async (req, res) => {
  const parentDirectory = req.params.reference_Id;

  try {
    const directoriesOfUser = await Directory.find({ parentDirectory });

    if (!directoriesOfUser.length) {
      throw new NotFound(
        "No directories found for the specified parent directory.",
        true
      );
    }

    const user_id = directoriesOfUser[0]?.user_id;

    const allDirectories = await Directory.find({ user_id });

    const data = allDirectories.map(({ _id, name }) => ({
      path: _id,
      label: name,
    }));

    const responsObject = new SuccessResponse(
      true,
      null,
      data
    );    

    res.status(StatusCodes.OK).json(responsObject);
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
});

module.exports = getAllDirForMoving
