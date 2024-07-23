const {
    expressAsyncHandler,
    File,
    mongoose,
    NotFound,
} = require('./configurations');


// Middleware to delete a file
module.exports.downloadFile = expressAsyncHandler(async (req, res) => {
    const { fileId } = req.params;
    console.log('fileId',fileId)
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const file = await File.findById(fileId).session(session);
        if (!file) {
            throw new NotFound('File not found');
        }
        const { url, originalname, name,size } = file;       
        const imageObject = { url, originalname,size };
        await session.commitTransaction(); 
        res.send(imageObject);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
