const expressAsyncHandler = require("express-async-handler");
const File = require("../model");
const NotFound = require("../../../Errors/Notfound");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const SuccessResponse = require("../../../utils/successResponse");
const Handler = new ErrorHandler();

const getAllFiles = expressAsyncHandler(async (req, res) => {
  const user_id = req.user;
  try {
    const userFiles = await File.find({ user_id });

    const data = userFiles.map((item) => {
      const { _id, name, mimetype } = item;
      return {
        name,
        value: _id.toString(),
        mimetype,
      };
    });

    if (!data.length) {
      throw new NotFound("No files found for the user", true);
    }

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

module.exports = getAllFiles;
