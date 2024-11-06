const { User, mongoose, bcryptjs, asyncHandler, StatusCodes, BadRequest } = require("./auth.configurations");

module.exports.forgotPassword = asyncHandler(async (req, res) => {
  // Retrieve the user ID from the authenticated request
  const user_id = req.user;

  // Start a MongoDB session for transaction handling
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Extract the password from the request body
    const { password } = req.body;

    // Ensure the password is provided
    if (!password) throw new BadRequest('Please provide a password');

    // Find the user by the user ID (from the authenticated request)
    const userExist = await User.findById(user_id);

    // If the user is not found, throw a BadRequest error
    if (!userExist) throw new BadRequest('No such user');

    // Hash the new password using bcrypt
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Update the user's password with the hashed password within the session
    await User.findByIdAndUpdate(
      user_id, 
      { password: hashedPassword }, 
      { session }
    );

    // Commit the transaction once the update is successful
    await session.commitTransaction();

    // Respond with a success message
    res.status(StatusCodes.OK).json({ message: 'Password update was successful' });
    
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
});
