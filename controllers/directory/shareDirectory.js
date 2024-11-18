const directory = require('../../models/directory');
const { handleFileDuplication } = require('../../utils/file/handleFileDuplication');
const generateRandomString = require('../../utils/generateRandomString');
const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
    Share,
    File,
} = require('./configurations');

const shareDirectory = expressAsyncHandler(async (req, res) => {
    const { fileIds, name } = req.body; 
    const user = req.user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let duplicatedFiles = [];
        let rejectedFiles = [];
        let sharedFilesList = [];
        let moveFileDetails = []

        for (const file of fileIds) {
            const fileExist = await File.findById(file);
            if (!fileExist) {
                rejectedFiles.push(file);
                continue;
            }
            duplicatedFiles.push(fileExist);
        }

        const userSharedFilesDirectory = await Directory.findOne({ user_id: user, name: 'SharedFiles' });

        duplicatedFiles.forEach((value)=>{
            if(value.shared){
                const sharedFiles = {
                    name: `${value.name}`,
                    shared: value.shared,
                    user_id: user,
                    url:value.url,
                    mimetype: value.mimetype,
                    directoryId: userSharedFilesDirectory._id,
                    size: value.size,
                }

                sharedFilesList.push(sharedFiles)
            } else {
                const newlyDuplicatedFiles = {
                    name: `${value.name}`,
                    shared: true,
                    user_id: user,
                    url:value.url,
                    mimetype: value.mimetype,
                    directoryId: userSharedFilesDirectory._id,
                    size: value.size,
                }
                
                sharedFilesList.push(newlyDuplicatedFiles)

            }
            
        })        

        const createdDuplicatedFiles = await File.insertMany(sharedFilesList, { session });

        for (const file of createdDuplicatedFiles) {
            const regex = /2Fshared/;
            if (regex.test(file.url)) {
                continue;
            }
            moveFileDetails.push({
                fileId: file._id,
                filename: file.name,
                userId: user
            });
        }
    
        const idsOfEditedDuplicated = createdDuplicatedFiles.map(file => file._id);

        const randomString = `${generateRandomString(8)}@sr`;

        const [sharedReference] = await Directory.create(
            [
                {
                    name: name,
                    user_id: user,
                    parentDirectory: userSharedFilesDirectory._id,
                    files: idsOfEditedDuplicated,
                    mimetype:"Shared",
                    secreteCode:randomString
                },
            ],
            { session }
        );

        userSharedFilesDirectory.subDirectories.push(sharedReference._id);
        await userSharedFilesDirectory.save({ session });

        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            message: 'Files duplicated successfully',
            secreteCode: randomString,
            rejectedFiles,
        });

        setImmediate(() => {
            moveFileDetails.forEach(async (file) => {
                try {
                    await handleFileDuplication(file);
                } catch (error) {
                    console.error('Error in handleFileDuplication:', error);
                }
            });
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

module.exports = { shareDirectory };
