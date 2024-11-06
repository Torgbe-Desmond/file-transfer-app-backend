const _handleFileCreation = require('../../utils/file/_handleFileCreation');
const { 
    expressAsyncHandler, 
    Directory, 
    File, 
    mongoose, 
    NotFound, 
    StatusCodes
} = require('./configurations');

module.exports.createFile = expressAsyncHandler(async (req, res) => {
    const { user: user_id } = req;
    const { directoryId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const directoryExist = await Directory.findById(directoryId).session(session);
        if (!directoryExist) {
            throw new NotFound(`Directory with ID ${directoryId} not found.`);
        }
        
        const { files, fileIds } = await _handleFileCreation(user_id, req.files, directoryId);

        // Filter out files that already exist
        const filesToInsert = [];
        for (const file of files) {
            const fileExist = await File.findOne({ name: file.name }).session(session);
            if (!fileExist) {
                filesToInsert.push(file);
            }
        }

        // Insert files in bulk if there are new files
        let createdFiles = [];
        if (filesToInsert.length > 0) {
            createdFiles = await File.insertMany(filesToInsert, { session });
        }

        // Add created file IDs to the directory
        const newFileIds = createdFiles.map(file => file._id);
        directoryExist.files.push(...newFileIds);

        // Save the updated directory
        await directoryExist.save({ session });

        await session.commitTransaction();

        // Return the inserted files as the response
        res.status(StatusCodes.CREATED).json({ files: createdFiles });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
