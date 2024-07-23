const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
    payDesmondUtils,
} = require('./configurations');



module.exports.deleteFile = expressAsyncHandler(async (req, res) => {
    const { fileIds, directoryId } = req.body;
    const  user_id = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        let deletedFiles = [];

        for (const fileId of fileIds) {
            const fileExist = await File.findOne({ _id: fileId }).session(session);
            if (fileExist===null) continue;
            const fileExisted = await File.findByIdAndDelete(fileId,{session});
            deletedFiles.push(fileExisted._id)
            if (fileExisted) await payDesmondUtils.deleteFileFromStorage(user_id,fileExisted.originalname);
        }

        const fileDirectory = await Directory.findById(directoryId).session(session);
        fileDirectory.files.pull(...deletedFiles);  
        await fileDirectory.save();

        await session.commitTransaction();

        res.status(StatusCodes.OK).json(deletedFiles);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
