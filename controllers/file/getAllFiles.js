const {
    expressAsyncHandler,
    File,
    StatusCodes,
    NotFound,
} = require('./configurations');

module.exports.getAllFiles = expressAsyncHandler(async (req, res) => {
    const user_id = req.user;
    try {
        const userFiles = await File.find({ user_id });
        
        const allFiles = userFiles.map(item => {
            const { _id, name, mimetype } = item;
            return {
                name,
                value: _id.toString(),
                mimetype,
            };
        });

        if (!allFiles.length) {
            throw new NotFound('No files found for the user');
        }

        res.status(StatusCodes.OK).json(allFiles);
    } catch (error) {
        throw error;
    }
});
