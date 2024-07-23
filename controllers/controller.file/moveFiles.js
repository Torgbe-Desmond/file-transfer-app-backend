const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
    NotFound,
} = require('./configurations');

module.exports.moveFiles = expressAsyncHandler(async (req, res) => {
    const { DirectoriesToMoveFileTo, FileIds, DirectoryFileIsMoveFrom } = req.body;
    console.log(DirectoriesToMoveFileTo, FileIds, DirectoryFileIsMoveFrom);
    const _id = DirectoryFileIsMoveFrom;

    const session = await mongoose.startSession();
    session.startTransaction();

    let transactionCommitted = false;

    try {
        const sourceDirectory = await Directory.findById(_id).session(session);
        if (!sourceDirectory) {
            throw new NotFound(`Source directory with ID ${_id} does not exist`);
        }

        let movedFileIds = [];

        for (const targetId of DirectoriesToMoveFileTo) {
            const targetDirectory = await Directory.findById(targetId).session(session);
            if (!targetDirectory) {
                throw new NotFound(`Target directory with ID ${targetId} does not exist`);
            }


            for (const fileId of FileIds) {
                sourceDirectory.files.pull(fileId);
                targetDirectory.files.push(fileId);

                const file = await File.findById(fileId).session(session);
                movedFileIds.push(file._id);

                if (file) {
                    file.directoryId = targetId;
                    await file.save();
                } else {
                    throw new NotFound(`File with ID ${fileId} not found.`);
                }
            }

            await targetDirectory.save();
        }

        await sourceDirectory.save();

        await session.commitTransaction();
        transactionCommitted = true;

        res.status(StatusCodes.OK).json(movedFileIds);
    } catch (error) {
        if (!transactionCommitted) {
            await session.abortTransaction();
        }
        throw error;
    } finally {
        session.endSession();
    }
});
