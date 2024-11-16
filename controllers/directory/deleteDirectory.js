const notFound = require('../../middleware/notFound');
const { deleteFileFromStorage } = require('../../utils');
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
        const parent = await Directory.findById(parentDirectory).session(session);
        if (!parent) {
            throw new NotFound('Parent directory not found.');
        }

        let rootDirectoriesInParentDirectory = [];
        let rootFilesInParentDirectory = [];
        let deletedFiles = [];

        for (const directoryId of directoryIds) {
            console.info('Deletiong started..')
            const directoryExist = await Directory.findById(directoryId).session(session);
            if (!directoryExist) {
                throw new NotFound(`Directory with ID ${directoryId} not found.`);
            }

            const directoryTreeObject = await getDirectoryTree(directoryExist._id, session);
            if (directoryTreeObject) {
                const parentDir = directoryTreeObject.directoriesToDelete.shift();
                rootDirectoriesInParentDirectory.push(parentDir);
                rootFilesInParentDirectory.push(...directoryTreeObject.filesToDelete);

                const deletedResults = await deleteDirectoryTree(directoryTreeObject, session);
                deletedFiles.push(...deletedResults);
            }

            const { directoriesToDelete, filesToDelete } = directoryTreeObject;

            if (directoriesToDelete.length > 0) {
                directoryExist.subDirectories.push(...directoriesToDelete);
            }
            if (filesToDelete.length > 0) {
                directoryExist.files.pull(...filesToDelete);
            }

            await directoryExist.save({ session });
        }

        console.info('Done with schema deletion..')



        // Delete files from storage
        for (const { name, user_id } of deletedFiles) {
            await deleteFileFromStorage(user_id, name);
        }

        // Remove directories from the database and update parent directory
        await Directory.deleteMany({ _id: { $in: rootDirectoriesInParentDirectory } }).session(session);
        parent.subDirectories.pull(...rootDirectoriesInParentDirectory);
        parent.files.pull(...rootFilesInParentDirectory);

        await parent.save({ session });

        const filesAndDirectoriesToDelete = [...rootDirectoriesInParentDirectory, ...rootFilesInParentDirectory];

        await session.commitTransaction();

        res.status(StatusCodes.OK).json({ message: 'Directories deleted successfully', filesAndDirectoriesToDelete });
    } catch (error) {
        console.log('error',error)
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
