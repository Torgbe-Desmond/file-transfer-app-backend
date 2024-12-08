const _handleFileCreation = require('../../utils/file/_handleFileCreation');
const { 
    expressAsyncHandler, 
    Directory, 
    File, 
    mongoose, 
    NotFound, 
    StatusCodes
} = require('./configurations');
const { fileQueue } = require('../../socket/functions/uploadFunction')



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
        
        const { files } = await _handleFileCreation(user_id, req.files, directoryId);

        const filesToInsert = [];

        for (const file of files) {
            const fileExist = await File.findOne({ name: file.name }).session(session);
            if (!fileExist) {
                filesToInsert.push(file);
            } else {
                continue
            }
        }

        let createdFiles = [];
        
        if (filesToInsert.length > 0) {
            createdFiles = await File.insertMany(filesToInsert, { session });
        }

        const newFileIds = createdFiles.map(file => file._id);
        directoryExist.files.push(...newFileIds);

        await directoryExist.save({ session });

        await session.commitTransaction();

        res.status(StatusCodes.CREATED).json({ files: createdFiles });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
