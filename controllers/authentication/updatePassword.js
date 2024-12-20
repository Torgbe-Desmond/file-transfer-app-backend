const { User, mongoose, bcryptjs, asyncHandler, StatusCodes, BadRequest } = require("./configurations");

module.exports.updatePassword = asyncHandler(async (req, res) => {
  const user_id = req.user;

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { newPassword } = req.body;

    if (!newPassword) throw new BadRequest('Please provide a password');

    const userExist = await User.findById(user_id);

    if (!userExist) throw new BadRequest('No such user');

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    const updatedPassword = await User.findByIdAndUpdate(
      user_id, 
      { password: hashedPassword }, 
      { session }
    );

    // console.log('updatedPassword',updatedPassword)

    await session.commitTransaction();

    res.status(StatusCodes.OK).json({ message: 'Password update was successful' });
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
});
