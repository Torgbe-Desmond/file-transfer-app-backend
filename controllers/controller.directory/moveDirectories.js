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
    console.log('Directories to move:', directoriesToMove, 'Directory to move to:', directoryToMoveTo);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Ensure we only have one target directory to move to
        if (directoryToMoveTo.length !== 1) {
            throw new BadRequest('There should be exactly one target directory to move the directories into.');
        }

        const targetDirectoryId = directoryToMoveTo[0];

        let moveDirectories = []

        // Move each directory to the target directory
        for (const directoryId of directoriesToMove) {
            // Update the parentDirectory field of the directory
            await Directory.findOneAndUpdate(
                { _id: directoryId },
                { parentDirectory: targetDirectoryId },
                { session }
            );
        
            // Find the directory to remove from its current parent
            const removeFromParentDirectory = await Directory.findById(directoryId);
        
            // Find the current parent directory and remove the directoryId from its children array
            const findParentDirectory = await Directory.findById(removeFromParentDirectory.parentDirectory);
            if (findParentDirectory) {
                findParentDirectory.subDirectories.pull(directoryId);
                await findParentDirectory.save({ session });
            }
        
            // Push the directoryId to the moveDirectories array
            moveDirectories.push(directoryId);
        }

        // Add the moved directories to the subdirectories of the target directory
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