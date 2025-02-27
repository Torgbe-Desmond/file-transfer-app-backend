const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const User = require("../model");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const BadRequest = require("../../../Errors/BadRequest");
const { default: mongoose } = require("mongoose");
const {
  sendEmaiToRecipient,
} = require("../../../utils/nodemailerConfiguration");
const SuccessResponse = require("../../../utils/SuccessResponse");
const generatePasswordVerificationToken = require("../../../utils/generatePasswordVerificationToken");
const Handler = new ErrorHandler();

const sendEmailForVerification = asyncHandler(async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email } = req.body;

    if (!email) throw new BadRequest("Please provide an email", true);

    const userExist = await User.findOne({ email });

    if (!userExist) throw new BadRequest("No such user");

    const url = ["https://student-rep.vercel.app", "http://localhost:3000"];

    const verification = {
      username: userExist.username,
      to: [userExist.email],
      subject: "Student Rep Email Verification",
      verificationLink: `${url[0]}/${userExist.reference_Id}/update-password/`,
    };

    await sendEmaiToRecipient(verification);

    const token = generatePasswordVerificationToken()

    const responsObject = new SuccessResponse(
      true,
      "Email sent successfully!",
      token
    );

    await session.commitTransaction();

    res.status(StatusCodes.OK).json(responsObject);

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

module.exports = sendEmailForVerification
