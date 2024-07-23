const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    mongoose,
} = require('./configurations');


module.exports.getAdirectory = expressAsyncHandler(async (req, res) => {
 
    try {
        const parentDirectory = req.params.directoryId;
        
        const specificDirectoryExist = await Directory.find({ parentDirectory })

        await Directory.findOne({ parentDirectory })

        const editedSpecificDirectoryExist = specificDirectoryExist.map((value) => {
        const { _id, parentDirectory, name, mimetype, size, lastUpdated, subDirectories, files } = value;
        
            // Calculate the total number of subDirectories and files
            let totalSize = (subDirectories.length + files.length) || 0;
        
            // Return a new object with the transformed properties
            return {
                _id,
                parentDirectory,
                name,
                mimetype,
                size: totalSize,
                lastUpdated,
                subDirectories,
                files
            };
        });


        res.status(StatusCodes.OK).json(editedSpecificDirectoryExist);
        
    } catch (error) {
        throw error;
    } 
});
