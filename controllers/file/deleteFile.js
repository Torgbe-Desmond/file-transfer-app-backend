// Import necessary utility functions and configurations
const { deleteFileFromStorage } = require('../../utils/FirebaseInteractions');
const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
    payDesmondUtils,
} = require('./configurations');

// Async handler to delete files from a specified directory
module.exports.deleteFile = expressAsyncHandler(async (req, res) => {
    // Extract file IDs and directory ID from the request body
    const { fileIds, directoryId } = req.body;
    console.log(fileIds, directoryId)
    const user_id = req.user; // Get the user ID from the request

    // Start a new Mongoose session for transaction management
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Array to hold the IDs of deleted files
        let deletedFiles = [];

        // Loop through each file ID to delete the corresponding file
        for (const fileId of fileIds) {
            // Check if the file exists in the database
            const fileExist = await File.findOne({ _id: fileId }).session(session);
            if (fileExist === null) continue; // If the file doesn't exist, skip to the next iteration
            
            // Delete the file from the database and push its ID to the deletedFiles array
            const fileExisted = await File.findByIdAndDelete(fileId, { session });
            deletedFiles.push(fileExisted._id); // Store the deleted file's ID
            
            // If the file was successfully deleted, remove it from storage
            if (fileExisted) {
                await deleteFileFromStorage(user_id, fileExisted.originalname);
            }
        }

        // Find the corresponding directory and remove the deleted files from its files array
        const fileDirectory = await Directory.findById(directoryId).session(session);
        fileDirectory.files.pull(...deletedFiles); // Remove deleted file IDs from the directory's files array
        
        // Save the updated directory
        await fileDirectory.save();

        // Commit the transaction to finalize the changes
        await session.commitTransaction();

        // Respond with the IDs of the deleted files
        res.status(StatusCodes.OK).json(deletedFiles);
    } catch (error) {
        // Abort the transaction if an error occurs
        await session.abortTransaction();
        throw error; // Rethrow the error for further handling
    } finally {
        // End the Mongoose session
        session.endSession();
    }
});
