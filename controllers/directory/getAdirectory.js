const { combinedFilesAndDirectories } = require('../../utils/directory/combinedFilesAndDirectories');
const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    NotFound,
} = require('./configurations');
module.exports.getAdirectory = expressAsyncHandler(async (req, res) => {
    
    try {
        
        const _id = req.params.directoryId;

        const data = await Directory.findOne({ _id })
            .populate('subDirectories') 
            .populate('files') 
            .exec();

        if (!data) {
            throw new NotFound('Directory not found')
        }

        const directoriesAndFiles = combinedFilesAndDirectories({ data });

        res.status(StatusCodes.OK).json(directoriesAndFiles);

    } catch (error) {
        throw error;
    } 
});
