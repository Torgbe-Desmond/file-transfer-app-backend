const Directory = require("../../directory/model");
const NotFound = require("../../../Errors/Notfound");
const BadRequest = require("../../../Errors/BadRequest");
const SuccessResponse = require("../../../utils/SuccessResponse");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const File = require("../../file/model");
const { StatusCodes } = require("http-status-codes");
const expressAsyncHandler = require("express-async-handler");
const Handler = new ErrorHandler();

const localSearch = expressAsyncHandler(async (req, res) => {
  try {
    const { searchTerm } = req.params;

    if (!searchTerm) {
      throw new BadRequest("Please provide an item to search", true);
    }

    // Search in Directory first
    let searchResults = await Directory.find({
      name: { $regex: searchTerm, $options: "i" },
    })
      .populate("subDirectories")
      .populate("files")
      .exec();

    // If no results in Directory, search in File
    if (searchResults.length === 0) {
      searchResults = await File.find({
        name: { $regex: searchTerm, $options: "i" },
      });
    }

    // If still no results, throw NotFound error
    if (searchResults.length === 0) {
      throw new NotFound(`No results found for: ${searchTerm}`, true);
    }

    // Success response
    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(true, "Results found", searchResults));
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
});

module.exports = localSearch;
