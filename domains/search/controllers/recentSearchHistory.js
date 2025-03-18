const SuccessResponse = require("../../../utils/SuccessResponse");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const { StatusCodes } = require("http-status-codes");
const UserSearch = require("../model");
const expressAsyncHandler = require("express-async-handler");
const Handler = new ErrorHandler();

const recentSearchHistory = expressAsyncHandler(async (req, res) => {
  try {
    const userId = req.user;

    let searchHistory = await UserSearch.find({ userId });

    console.log('searchHistory',searchHistory)

    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse(true, null, searchHistory));
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
});

module.exports = recentSearchHistory;
