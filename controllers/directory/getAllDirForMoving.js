const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    NotFound,
} = require('./configurations');

module.exports.getAllDirForMoving = expressAsyncHandler(async (req, res) => {
    const parentDirectory = req.params.reference_Id;

    try {
        
        const directoriesOfUser = await Directory.find({ parentDirectory });

        if (!directoriesOfUser.length) {
            throw new NotFound('No directories found for the specified parent directory.')
        }

        const user_id = directoriesOfUser[0].user_id;

        const allDirectories = await Directory.find({ user_id });

        const editedAllDirectories = allDirectories.map(({ _id, name}) => ({
            path:_id,
            label:name
        }));
        

        res.status(StatusCodes.OK).json(editedAllDirectories);

    } catch (error) {
        throw error;
    }
});
