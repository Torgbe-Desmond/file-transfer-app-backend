const { combinedFilesAndDirectories } = require('../../utils/directory/combinedFilesAndDirectories');
const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    NotFound,
} = require('./configurations');

module.exports.getStudentDirectory = expressAsyncHandler(async (req, res) => {
    const _id = req.params.directoryId;

    try {
        // Fetch the directory with the given ID
        const data = await Directory.findOne({ _id })
            .populate('subDirectories')
            .populate('files')
            .exec();

        // Check if the directory exists
        if (!data) {
            throw new NotFound('Directory not found.');
        }

        // Combine files and directories using the utility function
        const directoriesAndFiles = combinedFilesAndDirectories({ data });
        
        // Send the combined result in the response
        res.status(StatusCodes.OK).json(directoriesAndFiles);
        
    } catch (error) {
        // Handle unexpected errors
        throw error;
    }  
});
