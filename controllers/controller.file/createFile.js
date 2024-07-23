const {
    expressAsyncHandler,
    Directory,
    File,
    mongoose,
    uploadFileToGroup,
    uploadFileToStorage,
    NotFound,
    handleFileCreation,
    transformFileData
} = require('./configurations');

// Middleware to create a file
module.exports.createFile = expressAsyncHandler(async (req, res) => {
    const { user: user_id } = req;
    const { directoryId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const directoryExist = await Directory.findById(directoryId);

        if (!directoryExist) {
            throw new NotFound(`Directory with ID ${directoryId} not found.`);
        }

        console.log(req.files)

        let fileObject = [];
        let fileIdsArray = [];

        for (const file of req.files) {
            let uploadFunction = directoryExist.mimetype === 'Subscription' ? uploadFileToGroup : uploadFileToStorage;
            const newFile = await handleFileCreation(file, File, user_id, uploadFunction, session, directoryId);

            directoryExist.files.push(newFile._id);
            fileObject.push(newFile);
            fileIdsArray.push(newFile._id)
        }

        await directoryExist.save();
        await session.commitTransaction();
        res.status(201).json(fileObject);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

