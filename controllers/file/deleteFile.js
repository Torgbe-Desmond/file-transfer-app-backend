// Import necessary utility functions and configurations
const { deleteFileFromStorage } = require('../../utils/FirebaseInteractions');
const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
} = require('./configurations');

// Async handler to delete files from a specified directory
module.exports.deleteFile = expressAsyncHandler(async (req, res) => {
    const { fileIds, directoryId } = req.body;
    const user_id = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let deletedFiles = [];

        for (const fileId of fileIds) {
            const fileExist = await File.findOne({ _id: fileId }).session(session);
            if (!fileExist) continue;

            const fileExisted = await File.findByIdAndDelete(fileId, { session });
            if (fileExisted) {
                try {
                    await deleteFileFromStorage(user_id, fileExisted.name);
                    deletedFiles.push(fileExisted._id);
                } catch (error) {
                    console.error(`Failed to delete file from storage: ${error.message}`);
                }
            }
        }

        const fileDirectory = await Directory.findById(directoryId).session(session);
        if (fileDirectory) {
            fileDirectory.files.pull(...deletedFiles);
            await fileDirectory.save({ session });
        }

        await session.commitTransaction();
        res.status(StatusCodes.OK).json(deletedFiles);

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
