const {
    expressAsyncHandler,
    Directory,
    File,
    StatusCodes,
    mongoose,
    payDesmondUtils,
    NotFound,
} = require('./configurations');

module.exports.moveFilesFromSubscriptionsToDownload = expressAsyncHandler(async (req, res) => {

    const {fileIDs} = req.body;
    const user_id = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const getDownloadsParentIdByUserId = await Directory.findOne({
            user_id,
            name: 'Downloads'
        }).session(session);

        if (!getDownloadsParentIdByUserId) {
            // Handle case where Downloads directory doesn't exist for the user
            throw new NotFound("Downloads directory not found for the user");
        }


        for (const fileId of fileIDs) {
            const file = await File.findById(fileId).session(session);
            if (file===null) {
                // Handle case where file doesn't exist
                continue; // Skip to the next iteration
            }

            let {originalname,user_id:subscriptionOwnerId} = file;
            let newFileId;
            if(originalname){
                 newFileId = await payDesmondUtils.downloadFileFromStorage(
                    subscriptionOwnerId,
                    originalname,
                    getDownloadsParentIdByUserId._id,
                    user_id,
                    session
                );
                    
            }


            getDownloadsParentIdByUserId.files.push(newFileId);
            await getDownloadsParentIdByUserId.save()
        }


        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            message:'files have been succesfully moved to your download folder'
        })

    } catch (error) {
        // Handle errors
      await session.abortTransaction();
      throw error;
    } finally {
        session.endSession();
    }
});