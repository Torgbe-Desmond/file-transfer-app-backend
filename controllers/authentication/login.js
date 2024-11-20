const { Secrete } = require("../directory/configurations");
const { 
  User, 
  bcryptjs, 
  NotFound, 
  generateAuthToken, 
  asyncHandler, 
  StatusCodes 
} = require("./configurations");

module.exports.loginUser = asyncHandler(async (req, res) => {
  try {

    const { email, password } = req.body;
    
    const userExist = await User.findOne({ email });

    if (!userExist) throw new NotFound('Invalid credentials');

    const validPassword = await bcryptjs.compare(password, userExist.password);

    if (!validPassword) throw new NotFound('Invalid credentials');

    const token = generateAuthToken(userExist._id);

    res.status(StatusCodes.OK).json({
      token,
      reference_Id: userExist.reference_Id,
    })
  } catch (error) {
    throw error;
  }
});
