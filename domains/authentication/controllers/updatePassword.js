const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const bcryptjs = require("bcryptjs");  // Added bcryptjs import
const User = require('../model');
const ErrorHandler = require('../../../Errors/ErrorHandler');
const BadRequest = require("../../../Errors/BadRequest");
const { default: mongoose } = require("mongoose");
const SuccessResponse = require("../../../utils/successResponse");
const { addToBlacklist } = require("../../../utils/blackList");
const Handler = new ErrorHandler();

const updatePassword = asyncHandler(async (req, res) => {
  const user_id = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { newPassword } = req.body;
    const header = req.headers.authorization;

    if (!newPassword) throw new BadRequest("Please provide a password");

    const userExist = await User.findById(user_id);

    if (!userExist) throw new BadRequest("No such user");

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      user_id,
      { password: hashedPassword },
      { session }
    );

    await session.commitTransaction();

    const responseObject = new SuccessResponse(
      true,
      "Password update was successful",
      null
    );

    if(header && header.startsWith("Bearer ") && responseObject) {
      const token = header.split(" ")[1];
      addToBlacklist(token);
    }

    res
      .status(StatusCodes.OK)
      .json(responseObject);
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

module.exports = updatePassword