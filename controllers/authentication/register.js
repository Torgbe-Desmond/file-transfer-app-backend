const { User, mongoose, bcryptjs, UserSubscriptions, Directory, StatusCodes, generateAuthToken, BadRequest, uuidv4, asyncHandler } = require("./auth.configurations");

module.exports.registerUser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      throw new BadRequest('Please provide email, password, and username');
    }

    const userExist = await User.findOne({ email });

    if (userExist) throw new BadRequest('Account already exists');

    const hashedPassword = await bcryptjs.hash(password, 10);
    const reference_Id = uuidv4();

    const newUser = await User.create([{
      username,
      email,
      password: hashedPassword,
      reference_Id,
    }], { session });

    await UserSubscriptions.create([{ userId: newUser[0]._id }], { session });

    const defaultFolders = ["Home","Subscriptions"];

    for (const name of defaultFolders) {
      await Directory.create([{ name, parentDirectory: reference_Id, user_id: newUser[0]._id }], { session });
    }

    const token = generateAuthToken(newUser[0]._id);

    await session.commitTransaction();

    res.status(StatusCodes.CREATED).json({
      token,
      reference_Id,
      message: 'User registered successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
