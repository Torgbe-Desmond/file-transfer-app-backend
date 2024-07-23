
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
                // Directory doesn't exist, respond with an error
                // throw new NotFound(`Directory with ID ${dirId} not found.`);
                continue;
            }

            // Use await with deleteDirectoryRecursive if it's asynchronous
            await deleteDirectoryRecursive(user_id, dirId, directory.parentDirectory, session);
            console.log('dird',dirId)
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

