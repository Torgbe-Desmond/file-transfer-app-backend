const { combinedFilesAndDirectories } = require('../../utils/directory/combinedFilesAndDirectories');
const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    mongoose,
} = require('./configurations');


module.exports.getStudentDirectory = expressAsyncHandler(async (req, res) => {
 
    try {
        const _id = req.params.directoryId;
        const data = await Directory.findOne({_id})
        .populate('subDirectories')
        .populate('files')
        .exec();

        const directoriesAndFiles = combinedFilesAndDirectories({data});
        res.status(StatusCodes.OK).json(directoriesAndFiles);
        
    } catch (error) {
        throw error;
    }  
});
