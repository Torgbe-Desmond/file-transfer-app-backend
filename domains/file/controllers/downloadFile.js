// Import necessary modules and configurations
const expressAsyncHandler = require("express-async-handler");
const File = require("../model");
const NotFound = require("../../../Errors/Notfound");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const Handler = new ErrorHandler();

const downloadFile = expressAsyncHandler(async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId).session(session);

    if (!file) {
      throw new NotFound("File not found", true);
    }

    const { url, name, size } = file;

    const fileObject = { url, name, size };

    res.send(fileObject);
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
});

module.exports = downloadFile;
