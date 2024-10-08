const { combinedFilesAndDirectories } = require('../../utils/directory/combinedFilesAndDirectories');
const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
} = require('./configurations');

module.exports.getAdirectory = expressAsyncHandler(async (req, res) => {
    try {
        // Extract the directory ID from the request parameters
        const _id = req.params.directoryId;

        // Fetch the directory from the database, populating subDirectories and files
        const data = await Directory.findOne({ _id })
            .populate('subDirectories') // Populates the subDirectories field
            .populate('files') // Populates the files field
            .exec();

        // Check if the directory was found
        if (!data) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Directory not found' });
        }

        // Combine files and directories using the utility function
        const directoriesAndFiles = combinedFilesAndDirectories({ data });

        // Send the combined data as a response
        res.status(StatusCodes.OK).json(directoriesAndFiles);
                
    } catch (error) {
        // Handle any errors that occur during the process
        throw error;
    } 
});
