const generateRandomString = require('../../utils/generateRandomString');
const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
    Share,
} = require('./configurations');

const shareDirectory = expressAsyncHandler(async (req, res) => {
    const { directoryId } = req.params; 
    const user = req.user

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const directory = await Directory.findById(directoryId);
        if (!directory) {
            throw new NotFound('Directory not found');
        }

        const files = directory.files; 
        
        if (!files || files.length === 0) {
            throw new BadRequest('No files to duplicate in this directory');
        }

        const duplicatedFiles = files.map((file)=>file._id);
        const randomString =  `${generateRandomString(8)}@sr`


        const shareResults = await Share.create([
            {
                owner:user,
                secretCode:randomString,
                files:duplicatedFiles
            }
        ],{session})


        await session.commitTransaction();

        res.status(StatusCodes.OK).json({
            message: 'Files duplicated successfully',
            shareResults,
        });
    } catch (error) {
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
});

module.exports = { shareDirectory };
