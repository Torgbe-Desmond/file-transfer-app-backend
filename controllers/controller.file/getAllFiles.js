const {
    expressAsyncHandler,
    File,
    StatusCodes,
    NotFound,
} = require('./configurations');


module.exports.getAllFiles = expressAsyncHandler(async (req, res) => {

    const user_id = req.user;

    const allFiles = await File.find({ user_id });

    if (!allFiles.length) {

        throw new NotFound('No files found for the user');

    }

    const filenames = allFiles.map(item => {

    const {_id, directoryId, originalname, url } = item;
     
        return {
            name: originalname,
            _id,
            mimetype,
            size,
            lastUpdated,
            url
        };
        
    });

    res.status(StatusCodes.OK).json(filenames);
});