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
        if (!Array.isArray(directoriesToMove) || directoriesToMove.length === 0) {
            throw new BadRequest('No directories specified to move.');
        }

        if (directoryToMoveTo.length !== 1) {
            throw new BadRequest('There should be exactly one target directory to move the directories into.');
        }

        const targetDirectoryId = directoryToMoveTo[0];

        const targetDirectory = await Directory.findById(targetDirectoryId).session(session);
        if (!targetDirectory) {
            throw new NotFound('Target directory not found.');
        }

        const directories = await Directory.find({ _id: { $in: directoriesToMove } }).session(session);
        if (directories.length !== directoriesToMove.length) {
            throw new NotFound('One or more directories to move were not found.');
        }

        let moveDirectories = [];

        for (const directory of directories) {
            await Directory.findOneAndUpdate(
                { _id: directory._id },
                { parentDirectory: targetDirectoryId },
                { session }
            );

            const parentDirectory = await Directory.findById(directory.parentDirectory).session(session);
            if (parentDirectory) {
                parentDirectory.subDirectories.pull(directory._id);
                await parentDirectory.save({ session });
            }

            moveDirectories.push(directory._id);
        }

        targetDirectory.subDirectories.push(...moveDirectories);
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
