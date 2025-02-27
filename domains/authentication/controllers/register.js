const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const User = require("../model");
const ErrorHandler = require("../../../Errors/ErrorHandler");
const BadRequest = require("../../../Errors/BadRequest");
const { v4: uuidv4 } = require("uuid");
const generateToken = require("../../../utils/generateToken");
const Handler = new ErrorHandler();
const bcryptjs = require("bcryptjs");
const SuccessResponse = require("../../../utils/SuccessResponse");
const {default:mongoose} = require('mongoose')
const Directory = require('../../directory/model')

const registerUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      throw new BadRequest(
        "Please provide email, password, and username",
        true
      );
    }

    const userExist = await User.findOne({ email });

    if (userExist) throw new BadRequest("Account already exists", true);

    const hashedPassword = await bcryptjs.hash(password, 10);

    const reference_Id = uuidv4();

    const newUser = await User.create(
      [
        {
          username,
          email,
          password: hashedPassword,
          reference_Id,
        },
      ],
      { session }
    );

    const defaultFolders = ["Workspace", "ReceivedFiles", "SharedFiles"];

    for (const name of defaultFolders) {
      await Directory.create(
        [{ name, parentDirectory: reference_Id, user_id: newUser[0]._id }],
        { session }
      );
    }

    const token = generateToken(newUser[0]._id);

    await session.commitTransaction();

    const data = {
      token,
      reference_Id,
    };

    const responsObject = new SuccessResponse(
      true,
      "Registration was succesfully",
      data
    );

    res.status(StatusCodes.CREATED).json(responsObject);
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


module.exports = registerUser