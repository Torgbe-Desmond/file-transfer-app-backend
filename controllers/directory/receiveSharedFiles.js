const {copyFileFromOneUserToAnother } = require('../../utils/FirebaseInteractions');
const {
    expressAsyncHandler,
    NotFound,
    StatusCodes,
    mongoose,
    File,
    Directory,
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

        let duplicatedFiles = [];

        for (const file of sharedFilesExist.files) {
                 
                 const fileExist = await File.findOne({_id:file._id,user_id:file.user_id})

                 if(!fileExist) continue;
              
                 const fileUrl = await copyFileFromOneUserToAnother(file?.user_id,user, file?.name);
                 
                 const fileObject = {
                     name: `${file.name}`,
                     user_id: user,
                     shared:false,
                     url: fileUrl,
                     mimetype: file.mimetype,
                     directoryId: directoryExist._id,
                     size: file.size
                 };
         
                 duplicatedFiles.push(fileObject);

        }
        
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
