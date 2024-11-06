const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    NotFound,
} = require('./configurations');

module.exports.getAllDirForMoving = expressAsyncHandler(async (req, res) => {
    const parentDirectory = req.params.reference_Id;

    try {
        // Get directories associated with the specified parent directory
        const directoriesOfUser = await Directory.find({ parentDirectory });

        // Check if any directories were found
        if (!directoriesOfUser.length) {
            throw new NotFound('No directories found for the specified parent directory.')
        }

        // Extract user ID from the first directory found
        const user_id = directoriesOfUser[0].user_id;

        // Get all directories belonging to the same user
        const allDirectories = await Directory.find({ user_id });

        // Map over the directories to create a formatted response
        const editedAllDirectories = allDirectories.map(({ _id, name}) => ({
            path:_id,
            label:name
        }));

        console.log(editedAllDirectories)

        // Send the formatted directories in the response
        res.status(StatusCodes.OK).json(editedAllDirectories);

    } catch (error) {
        // Handle unexpected errors
        throw error;
    }
});
