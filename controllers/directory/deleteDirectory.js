const notFound = require('../../middleware/notFound');
const { deleteDirectoryTree } = require('../../utils/directory/deleteDirectoryRecursive');
const getDirectoryTree = require('../../utils/directory/getDirectoryTree');
const {
    expressAsyncHandler,
    StatusCodes,
    mongoose,
    Directory,
    NotFound,
} = require('./configurations');

module.exports.deleteDirectory = expressAsyncHandler(async (req, res) => {
    const { directoryIds, parentDirectory } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const parent = await Directory.findById(parentDirectory);
        if (!parent) {
            throw new NotFound('Directory not found.');
        }

        let rootDirectoriesInParentDirectory = [];
        let rootFilesInParentDirectory = []

        for (const directoryId of directoryIds) {
            // Check if directory exists
            const directoryExist = await Directory.findById(directoryId).session(session);
            if (!directoryExist) {
                throw new NotFound('Directory not found.');
            }

            console.log('directoryId',directoryId)

            // Retrieve the directory tree structure
            const directoryTreeObject = await getDirectoryTree(directoryExist._id, session);
            if (directoryTreeObject) {
                // The first id in the directoryToDelete array is the parent directory of the
                // directoriest to be deleted. This is assuming there are sub directories
                let parentDirectory = directoryTreeObject.directoriesToDelete.shift();
                rootDirectoriesInParentDirectory.push(parentDirectory)
                rootFilesInParentDirectory.push(...directoryTreeObject.filesToDelete)
                await deleteDirectoryTree(directoryTreeObject, session);
            }

            const { directoriesToDelete, filesToDelete } = directoryTreeObject;

            // Update subdirectories and files of the current directory
            if (directoriesToDelete.length > 0) {
                directoryExist.subDirectories.push(...directoriesToDelete);
            }
            if (filesToDelete.length > 0) {
                directoryExist.files.pull(...filesToDelete);
            }

            await directoryExist.save({ session });
        }


        await Directory.deleteMany({ _id: { $in: rootDirectoriesInParentDirectory } }).session(session);

        parent.subDirectories.pull(...rootDirectoriesInParentDirectory);
        parent.files.push(...rootFilesInParentDirectory);

        await parent.save()

        const filesAndDirectoriesToDelete = [...rootDirectoriesInParentDirectory,...rootFilesInParentDirectory]

        // Commit the transaction after successful operations
        await session.commitTransaction();

        res.status(StatusCodes.OK).json({ message: 'Directories deleted successfully', filesAndDirectoriesToDelete:filesAndDirectoriesToDelete });
    } catch (error) {
        await session.abortTransaction(); // Rollback the transaction on error
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Failed to delete directories' });
    } finally {
        session.endSession();
    }
});
