const { User, asyncHandler, StatusCodes } = require("./configurations");

module.exports.getAll = asyncHandler(async (req, res) => {
  // Fetch all users from the database
  const allUsers = await User.find({});

  // Respond with the list of all users and a 200 OK status
  res.status(StatusCodes.OK).json(allUsers);
});
