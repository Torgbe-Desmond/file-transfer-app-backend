const handleFileCreationHandler = require('../../utils/file/handleFileCreation');
const {
    expressAsyncHandler,
    Directory,
    File,
    mongoose,
    uploadFileToGroup,
    uploadFileToStorage,
    NotFound,
} = require('./configurations');
const createFile = new handleFileCreationHandler()

// Async handler to create files in a specified directory
module.exports.createFile = expressAsyncHandler(async (req, res) => {
    // Extract user ID and directory ID from the request
    const { user: user_id } = req;
    const { directoryId } = req.params;

    // Start a new Mongoose session for transaction management
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if the specified directory exists
        const directoryExist = await Directory.findById(directoryId).session(session);
        if (!directoryExist) {
            throw new NotFound(`Directory with ID ${directoryId} not found.`);
        }

        // Process file uploads concurrently
        await Promise.all(req.files.map(async (file) => {
            // Determine the appropriate upload function based on directory type
            const uploadFile = directoryExist.mimetype === 'Subscription' 
                ? uploadFileToGroup 
                : uploadFileToStorage;

            // Handle file creation and obtain the new file object
            const newFile = createFile.handleFileCreation(file, File, user_id, uploadFile, session, directoryId)
            // Add the new file ID to the directory's files array
            directoryExist.files.push(newFile._id);
        }));

        // Save the updated directory with the new files
        await directoryExist.save({ session });
        // Commit the transaction
        await session.commitTransaction();
        // Respond with the created file objects
        res.status(201).json({message:'Files created successfully'});
    } catch (error) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        throw error;
    } finally {
        // End the Mongoose session
        session.endSession();
    }
});
