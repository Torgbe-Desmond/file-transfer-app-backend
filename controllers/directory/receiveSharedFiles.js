const {
    expressAsyncHandler,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
    Share,
    File,
    Directory,
    Secrete
} = require('./configurations');

const receiveSharedFiles = expressAsyncHandler(async (req, res) => {
    const { secreteCode } = req.body;
    const user = req.user

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
    
        const directoryExist = await Directory.findOne({name:'ReceivedFiles',user_id:user});

        if(!directoryExist){
            throw new NotFound('Directory not found.');
        }

        const sharedFilesExist = await Directory.findOne({secreteCode:secreteCode}).populate('files');

        if(!sharedFilesExist){
            throw new NotFound('Shared files not found.');
        }

        const duplicatedFiles = sharedFilesExist.files.reduce((acc,value) =>{
            acc.push({
              name: `${value.name}`,
              shared: true,
              user_id:user,
              url:value.url,
              mimetype:value.mimetype,
              directoryId:directoryExist._id,
              size:value.size
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
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

module.exports = { receiveSharedFiles };
