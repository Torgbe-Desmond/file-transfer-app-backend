const {
    expressAsyncHandler,
    Directory,
    mongoose,
    BadRequest,
    NotFound,
    StatusCodes
} = require('./configurations');

module.exports.moveDirectories = expressAsyncHandler(async (req, res) => {
    const { directoriesToMove, directoryToMoveTo } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
       if (directoryToMoveTo.length !== 1) {
            throw new BadRequest('There should be exactly one target directory to move the directories into.');
        }

        const targetDirectoryId = directoryToMoveTo[0];

        let moveDirectories = []

        for (const directoryId of directoriesToMove) {
            await Directory.findOneAndUpdate(
                { _id: directoryId },
                { parentDirectory: targetDirectoryId },
                { session }
            );
        
            const removeFromParentDirectory = await Directory.findById(directoryId);
        
            const findParentDirectory = await Directory.findById(removeFromParentDirectory.parentDirectory);
            if (findParentDirectory) {
                findParentDirectory.subDirectories.pull(directoryId);
                await findParentDirectory.save({ session });
            }
        
            moveDirectories.push(directoryId);
        }

        const targetDirectory = await Directory.findById(targetDirectoryId).session(session);
        if (!targetDirectory) {
            throw new NotFound('Target directory not found.');
        }


        targetDirectory.subDirectories.push(...directoriesToMove);
        await targetDirectory.save({ session });

        await session.commitTransaction();
        res.status(StatusCodes.CREATED).json(moveDirectories);

    } catch (error) {   
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});