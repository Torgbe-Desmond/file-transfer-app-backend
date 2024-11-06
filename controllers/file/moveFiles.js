// Import necessary modules and configurations
const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
    NotFound,
} = require('./configurations');

// Middleware to handle moving files from one directory to another
module.exports.moveFiles = expressAsyncHandler(async (req, res) => {
    // Extract the target directories, file IDs, and source directory ID from the request body
    const { DirectoriesToMoveFileTo, FileIds, DirectoryFileIsMoveFrom } = req.body;
    const _id = DirectoryFileIsMoveFrom;

    // Start a session for the database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the source directory by ID
        const sourceDirectory = await Directory.findById(_id).session(session);
        // Check if the source directory exists; if not, throw an error
        if (!sourceDirectory) {
            throw new NotFound(`Source directory with ID ${_id} does not exist`);
        }

        let movedFileIds = []; // Array to hold IDs of moved files

        // Iterate over each target directory ID to move files into
        for (const targetId of DirectoriesToMoveFileTo) {
            // Find the target directory by ID
            const targetDirectory = await Directory.findById(targetId).session(session);
            // Check if the target directory exists; if not, throw an error
            if (!targetDirectory) {
                throw new NotFound(`Target directory with ID ${targetId} does not exist`);
            }

            // Iterate over each file ID to move from the source directory to the target directory
            for (const fileId of FileIds) {
                // Remove the file ID from the source directory's files
                sourceDirectory.files.pull(fileId);
                // Add the file ID to the target directory's files
                targetDirectory.files.push(fileId);

                // Find the file by ID
                const file = await File.findById(fileId).session(session);
                movedFileIds.push(file._id); // Add moved file ID to the array

                // If the file exists, update its directory ID and save; if not, throw an error
                if (file) {
                    file.directoryId = targetId; // Update the directory ID for the file
                    await file.save(); // Save the updated file
                } else {
                    throw new NotFound(`File with ID ${fileId} not found.`);
                }
            }

            // Save the changes to the target directory
            await targetDirectory.save();
        }

        // Save the changes to the source directory
        await sourceDirectory.save();

        // Commit the transaction to save all changes
        await session.commitTransaction();

        // Respond with the IDs of moved files
        res.status(StatusCodes.OK).json(movedFileIds);
    } catch (error) {
        // If any errors occur, abort the transaction
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session after processing
        session.endSession();
    }
});
