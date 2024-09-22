const { User,asyncHandler} = require("./auth.configurations");



module.exports.getAll = asyncHandler(async (req, res) => {
    const allUsers = await User.find({})
    res.status(StatusCodes.OK).json(allUsers)
})
