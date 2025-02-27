const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../../../Errors/Notfound");
const User = require("../model");
const SuccessResponse = require("../../../utils/SuccessResponse");
const BadRequest = require("../../../Errors/BadRequest");

const generateTokenForVerification = asyncHandler(async (req, res) => {
  const { reference_Id } = req.params;

  if (!reference_Id) {
    throw new BadRequest("Reference ID is required");
  }

  const userExist = await User.findOne({ reference_Id });

  if (!userExist) {
    throw new NotFound("User does not exist.");
  }

  const token = jwt.sign({ _id: userExist._id }, process.env.JWT_KEY, {
    expiresIn: "10m",
  });

  const data = {
    token,
  };

  const responsObject = new SuccessResponse(true, null, data);

  res.status(StatusCodes.OK).json(responsObject);
});

module.exports = generateTokenForVerification