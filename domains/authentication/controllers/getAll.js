const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const User = require('../model');
const SuccessResponse = require("../../../utils/SuccessResponse");

module.exports.getAll = asyncHandler(async (req, res) => {
  const data = await User.find({});
  const responsObject = new SuccessResponse(true, null, data);
  res.status(StatusCodes.OK).json(responsObject);
});
