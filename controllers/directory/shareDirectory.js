const directory = require('../../models/directory');
const generateRandomString = require('../../utils/generateRandomString');
const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    mongoose,
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

        for (const file of fileIds) {
            const fileExist = await File.findById(file);
            if (!fileExist) {
                rejectedFiles.push(file);
                continue;
            }
            duplicatedFiles.push(fileExist);
        }

        const userSharedFilesDirectory = await Directory.findOne({ user_id: user, name: 'SharedFiles' });

        const sharedFilesList = duplicatedFiles.map((file)=>({
             name: `${file.name}`,
             shared:true,
             user_id: user,
             url:file.url,
             mimetype: file.mimetype,
             directoryId: userSharedFilesDirectory._id,
             size: file.size,
         }))


        const createdDuplicatedFiles = await File.insertMany(sharedFilesList, { session });

        const idsOfDuplicatedFiles = createdDuplicatedFiles.map(file => file._id);

        const randomString = `${generateRandomString(8)}@sr`;

        const [sharedReference] = await Directory.create(
            [
                {
                    name: name,
                    user_id: user,
                    parentDirectory: userSharedFilesDirectory._id,
                    files: idsOfDuplicatedFiles,
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

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

module.exports = { shareDirectory };
