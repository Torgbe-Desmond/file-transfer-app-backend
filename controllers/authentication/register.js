const { 
  User, 
  mongoose, 
  bcryptjs, 
  Directory, 
  StatusCodes, 
  generateAuthToken, 
  BadRequest, 
  uuidv4, 
  asyncHandler 
} = require("./configurations");

// Register a new user
module.exports.registerUser = asyncHandler(async (req, res) => {
  // Start a new session to ensure atomic operations (transaction)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Extract user input from the request body
    const { email, password, username } = req.body;
    console.log(email,password,username)

    // Check if all required fields are provided
    if (!email || !password || !username) {
      throw new BadRequest('Please provide email, password, and username');
    }

    // Check if the user already exists in the database by email
    const userExist = await User.findOne({ email });

    // If user exists, throw an error to avoid duplicate accounts
    if (userExist) throw new BadRequest('Account already exists');

    // Hash the user's password for security
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate a unique reference ID for the user
    const reference_Id = uuidv4();

    // Create the new user in the database (within the transaction)
    const newUser = await User.create([{
      username,
      email,
      password: hashedPassword,
      reference_Id,
    }], { session });

    // Default folders to be created for every new user
    const defaultFolders = ["Workspace", "cli-interactions"];
    // for the cli interactions any file you upload using the cli would be stored here
    // though with the cli you have access to all your files

    // Create default directories (folders) for the new user in the Directory collection
    for (const name of defaultFolders) {
      await Directory.create([{ name, parentDirectory: reference_Id, user_id: newUser[0]._id }], { session });
    }

    // Generate an authentication token for the new user
    const token = generateAuthToken(newUser[0]._id);

    // Commit the transaction once all operations succeed
    await session.commitTransaction();

    // Respond to the client with success status and the generated token
    res.status(StatusCodes.CREATED).json({
      token,  // Authentication token to be used in future requests
      reference_Id,  // Unique reference ID for the user
      message: 'User registered successfully',
    });
  } catch (error) {
    // If there is any error during the transaction, abort it
    await session.abortTransaction();
    throw error;  // Rethrow the error to be handled by error middleware
  } finally {
    // End the session after completing the transaction
    session.endSession();
  }
});
