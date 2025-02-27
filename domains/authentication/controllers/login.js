const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const NotFound = require('../../../Errors/Notfound');
const User = require('../model')
const generateAuthToken = require('../../../utils/generateToken')
const ErrorHandler = require('../../../Errors/ErrorHandler')
const Handler = new ErrorHandler()
const bcryptjs = require('bcryptjs');
const SuccessResponse = require("../../../utils/SuccessResponse");

const loginUser = asyncHandler(async (req, res) => {
  try {

    const { email, password } = req.body;
    
    const userExist = await User.findOne({ email });

    if (!userExist) throw new NotFound('Invalid credentials',true);

    const validPassword = await bcryptjs.compare(password, userExist.password);

    if (!validPassword) throw new NotFound('Invalid credentials',true);

    const token = generateAuthToken(userExist._id);

    const data = {
      token,
      reference_Id:userExist.reference_Id
    }

    const responsObject = new SuccessResponse(
      true,
      "Login was succesfully",
      data
    );
    
    res.status(StatusCodes.OK).json(responsObject)
  } catch (error) {
    if (!Handler.isTrustedError(error)) {
      Handler.handleError(error);
    }
    throw error;
  }
});


module.exports = loginUser
