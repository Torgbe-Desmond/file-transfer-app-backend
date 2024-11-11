const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
} = require('./configurations');

// Duplicate files within a directory
const shareDirectory = expressAsyncHandler(async (req, res) => {
    const { directoryId } = req.params; // Assume directory ID is provided in the request parameters

    try {
        // Find the directory and files within it
        const directory = await Directory.findById(directoryId);
        if (!directory) {
            throw new NotFound('Directory not found');
        }

        // Fetch all files in the directory
        const files = directory.files; // Assuming `files` is an array of file references in the directory
        
        // Check if files exist to duplicate
        if (!files || files.length === 0) {
            throw new BadRequest('No files to duplicate in this directory');
        }

        // Duplicate each file in the directory
        const duplicatedFiles = files.map(file => {
            // Create a new object with the same properties, but generate a new unique ID
            return {
                ...file._doc, // Copy the original file data
                _id: new mongoose.Types.ObjectId(), // Generate a new ID for the duplicated file
                createdAt: new Date(), // Set a new creation timestamp
                name: `${file.name}_copy`, // Add "_copy" to the file name to indicate it's a duplicate
            };
        });
    
        // Save the duplicated files in the directory (assuming this is the correct way to update the directory)
        directory.files.push(...duplicatedFiles);
        await directory.save();

        res.status(StatusCodes.OK).json({
            message: 'Files duplicated successfully',
            duplicatedFiles,
        });
    } catch (error) {
        res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'An error occurred while duplicating files',
        });
    }
});

module.exports = { shareDirectory };
