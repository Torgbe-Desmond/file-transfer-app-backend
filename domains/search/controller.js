const Directory = require("../../domains/directory/model");
const NotFound = require("../../Errors/Notfound");
const BadRequest = require("../../Errors/BadRequest");
const SuccessResponse = require("../../utils/SuccessResponse");
const ErrorHandler = require("../../Errors/ErrorHandler");
const File = require("../../domains/file/model");
const { StatusCodes } = require("http-status-codes");
const UserSearch = require("./model");
const expressAsyncHandler = require("express-async-handler");
const Handler = new ErrorHandler();

const search = expressAsyncHandler(async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { user: userId } = req;

    if (!searchTerm) {
      throw new BadRequest("Please provide an item to search", true);
    }

    // Search in Directory first
    let searchResults = await Directory.find({
      name: { $regex: searchTerm, $options: "i" },
    });

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

    // Find the user's search document or create a new one
    let userSearch = await UserSearch.findOne({ userId });
    if (!userSearch) {
      userSearch = new UserSearch({ userId });
    }
    // Add the new search term
    await userSearch.addSearchTerm(searchTerm);

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

module.exports = search;
