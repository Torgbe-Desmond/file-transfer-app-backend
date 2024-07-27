const { expressAsyncHandler, Directory, StatusCodes } = require('../controller.comment/configurations');

module.exports.getAllComments = expressAsyncHandler(async (req, res) => {
    try {
        const _id = req.params.directoryId;
        const directory = await Directory.findOne({ _id }).populate('comments');

        if (!directory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Directory not found' });
        }

        res.status(StatusCodes.OK).json(directory.comments);

    } catch (error) {
        throw error;
    }
});
