const {
    expressAsyncHandler,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
    Share,
    File,
    Directory
} = require('./configurations');

const receiveSharedFiles = expressAsyncHandler(async (req, res) => {
    const { secretCode, directoryId } = req.body;
    const user = req.user

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const checkSecretCode = secretCode.split('@');
        if (!checkSecretCode.includes('sr')) {
            throw new BadRequest('Invalid secret.');
        }

        const directoryExist = await Directory.findOne({_id:directoryId});

        if(!directoryExist){
            throw new NotFound('Directory not found.');
        }

        const sharedFiles = await Share.findOne({ secretCode }).populate('files');
        if (!sharedFiles) {
            throw new NotFound('Share not found.');
        }

        if (sharedFiles.files.length === 0) {
            throw new NotFound('Share is empty.');
        }
  
        const duplicatedFiles = sharedFiles.files.reduce((acc,value) =>{
            acc.push({
              name: `${value.name}_$shared`,
              shared: true,
              user_id:user,
              url:value.url,
              mimetype:value.mimetype,
              directoryId
            })
            return acc;
        },[]);

        const createSharedFiles = await File.insertMany(duplicatedFiles,{session})

        const sharedFilesIds = createSharedFiles.map((file)=>file._id)

        directoryExist.files.push(...sharedFilesIds);

        await directoryExist.save({session});

        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            message: 'Files duplicated successfully.',
            createSharedFiles,
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

module.exports = { receiveSharedFiles };
