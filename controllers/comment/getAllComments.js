const { expressAsyncHandler, Directory, StatusCodes } = require('../comment/configurations');

module.exports.getAllComments = expressAsyncHandler(async (req, res) => {
    try {
        // Extract the directory ID from the request parameters
        const _id = req.params.directoryId;

        // Find the directory by its ID and populate the comments field with related comment data
        const directory = await Directory.findOne({ _id }).populate('comments');

        // If the directory is not found, return a 404 Not Found response
        if (!directory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Directory not found' });
        }

        // Respond with the list of comments associated with the directory
        res.status(StatusCodes.OK).json(directory.comments);

    } catch (error) {
        // Catch and rethrow any errors that occur during the process
        throw error;
    }
});
