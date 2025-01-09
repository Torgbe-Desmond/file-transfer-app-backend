// Import necessary utility functions and configurations
const { deleteFileFromStorage } = require('../../utils/FirebaseInteractions');
const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
} = require('./configurations');

module.exports.deleteFile = expressAsyncHandler(async (req, res) => {
    const { fileIds, directoryId } = req.body;
    const user_id = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let deletedFiles = [];
        let filesToBeDeletedImmediately = []

        for (const fileId of fileIds) {
            const fileExist = await File.findOne({ _id: fileId }).session(session);
            if (!fileExist){
                continue
            } else if(fileExist.shared === true){
                filesToBeDeletedImmediately.push(fileId);
                continue;
            }

            const fileExisted = await File.findByIdAndDelete(fileId, { session });
            if (fileExisted) {
                try {
                    if(!fileExisted.shared){
                        await deleteFileFromStorage(user_id, fileExisted.name);
                    }
                    deletedFiles.push(fileExisted._id);
                } catch (error) {
                    console.error(`Failed to delete file from storage: ${error.message}`);
                }
            }
        }


        if(filesToBeDeletedImmediately && filesToBeDeletedImmediately.length > 0 ){
            await File.deleteMany({ _id: { $in: filesToBeDeletedImmediately } }).session(session);
        }

        const fileDirectory = await Directory.findById(directoryId).session(session);
        if (fileDirectory) {
            fileDirectory.files.pull(...deletedFiles,...filesToBeDeletedImmediately);
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
