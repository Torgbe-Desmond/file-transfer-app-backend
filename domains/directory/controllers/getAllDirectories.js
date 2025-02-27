const expressAsyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const Directory = require("../model");
const NotFound = require("../../../Errors/Notfound");
const SuccessResponse = require("../../../utils/SuccessResponse");
const Handler = new ErrorHandler();

const getAllDirectories = expressAsyncHandler(async (req, res) => {
  const parentDirectory = req.params.reference_Id;
  console.log("parentDirectory", parentDirectory);
  try {
    const allDirectories = await Directory.find({ parentDirectory });

    if (!allDirectories.length) {
      throw new NotFound("No directories found for this reference ID.", true);
    }

    const data = allDirectories.map(
      ({
        _id,
        parentDirectory,
        name,
        mimetype,
        lastUpdated,
        subDirectories,
        files,
        privateDirectory,
      }) => {
        let totalSize = subDirectories.length + files.length || 0;
        return {
          _id,
          parentDirectory,
          privateDirectory,
          name,
          mimetype,
          size: totalSize,
          lastUpdated,
          subDirectories,
          files,
        };
      }
    );

    const responsObject = new SuccessResponse(true, null, data);

    res.status(StatusCodes.OK).json(responsObject);
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
});

module.exports = getAllDirectories;
