const { createSubscription } = require('../../utils/directory/createSubscription');
const { createDirectory: createNewDirectory } = require('../../utils/directory/createDirectory');
const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
} = require('./configurations');

module.exports.createDirectory = expressAsyncHandler(async (req, res) => {
    const { user: user_id, body: { name, excelFile,mimetype, courses } } = req;
    const parentDirectory = req.params.directoryId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let newDirectory;
        const directoryExist = await Directory.findOne({ _id: parentDirectory }).session(session);
        if (!directoryExist) {
            throw new NotFound('Directory does not exist');
        }

        const existingDirectory = await Directory.findOne({ parentDirectory, name }).session(session);
        if (existingDirectory) {
            throw new BadRequest('A directory with the specified name already exists');
        }

        if (directoryExist.name === 'Subscriptions' || directoryExist.mimetype === 'Subscription') {
            newDirectory = await createSubscription({
                name,
                session,
                user_id,
                parentDirectory,
                excelFile,
                directoryExist
            });
        } else {
            newDirectory = await createNewDirectory({
                name,
                user_id,
                parentDirectory,
                session,
                directoryExist,
                mimetype
            });
        } 

        const editedNewDirectory = newDirectory.map(({ _id, parentDirectory, name, mimetype, size, lastUpdated }) => ({
            _id,
            parentDirectory,
            name,
            mimetype,
            size,
            lastUpdated,
        }));

        await session.commitTransaction();

        res.status(StatusCodes.CREATED).json(editedNewDirectory);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
