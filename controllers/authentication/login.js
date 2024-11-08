const { 
  User, 
  bcryptjs, 
  NotFound, 
  generateAuthToken, 
  asyncHandler, 
  StatusCodes 
} = require("./configurations");
// Login user function
module.exports.loginUser = asyncHandler(async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;
    // Find user in the database by email
    const userExist = await User.findOne({ email });

    // If the user does not exist, throw a NotFound error
    if (!userExist) throw new NotFound('Invalid credentials');

    // Compare the provided password with the stored hashed password
    const validPassword = await bcryptjs.compare(password, userExist.password);

    // If the password does not match, throw a NotFound error
    if (!validPassword) throw new NotFound('Invalid credentials');

    // Generate a token for the authenticated user
    const token = generateAuthToken(userExist._id);

    res.status(StatusCodes.OK).json({
      token,
      reference_Id: userExist.reference_Id,  // Unique reference ID for the user
    })
  } catch (error) {
    // If an error occurs, throw it to be handled by error middleware
    throw error;
  }
});
