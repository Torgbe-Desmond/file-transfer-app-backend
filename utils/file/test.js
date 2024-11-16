const { default: mongoose } = require('mongoose');
const { Directory, File, NotFound, expressAsyncHandler } = require('../../controllers/file/configurations');
const { handleFileUploadWorker } = require('./handleFileUpload');
const { StatusCodes } = require('http-status-codes');

module.exports.createFile = expressAsyncHandler(async (req, res) => {
    const { user: user_id } = req;
    const { directoryId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();


    try {
        const directoryExist = await Directory.findById(directoryId).session(session);
        if (!directoryExist) {
            throw new NotFound(`Directory with ID ${directoryId} not found.`);
        }

        const filesToInsert = req.files.map(file => ({
            name: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            directoryId,
            user_id,
        }));

        const createdFiles = await File.insertMany(filesToInsert, { session });
        const newFileIds = createdFiles.map(file => file._id);
        directoryExist.files.push(...newFileIds);

        await directoryExist.save({ session });
        await session.commitTransaction();

        res.status(StatusCodes.CREATED).json({ files: createdFiles });

        req.files.forEach(file => handleFileUploadWorker(user_id.toString(), file));

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
