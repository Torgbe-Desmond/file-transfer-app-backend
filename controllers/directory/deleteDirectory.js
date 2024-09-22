
const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
    User,
    List,
    Group,
    deleteDirectoryRecursive
} = require('./configurations');


module.exports.deleteDirectory = expressAsyncHandler(async (req, res) => {
    const { directoryId } = req.body;
    const { user: user_id } = req;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const deletedDirectories = [];

        for (const dirId of directoryId) {

            const directory = await Directory.findById(dirId).session(session);
            if (!directory) {
                continue;
            }

            await deleteDirectoryRecursive(user_id, dirId, directory.parentDirectory, session);
            deletedDirectories.push(dirId);
        }

        await session.commitTransaction();
        res.status(StatusCodes.OK).json(deletedDirectories);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

