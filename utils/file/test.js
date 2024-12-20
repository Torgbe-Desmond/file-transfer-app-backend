const { default: mongoose } = require('mongoose');
const { Directory, File, NotFound, expressAsyncHandler } = require('../../controllers/file/configurations');
const { handleFileUploadWorker } = require('./handleFileUpload');
const { StatusCodes } = require('http-status-codes');
const {userSocketMap,getUserSocket} = require('../../socket/functions/users');
const { io } = require('../../socket/socket');
const { BadRequest } = require('../../Errors');

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

        const emitProgress = ({process,file,error}) => {
           io.to(getUserSocket(user_id)).emit('uploading', {
             process,
             file,
             error,
           });
         };

          for (const file of req.files) {
              try {
                const result = await handleFileUploadWorker(user_id.toString(), file);
                emitProgress(result);
              } catch (error) {
                console.error(error)
              }
         }
         

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
