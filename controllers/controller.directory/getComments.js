const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    mongoose,
    Comment
} = require('./configurations');


module.exports.getComment = expressAsyncHandler(async (req, res) => {
    try {
        const _id = req.params.directoryId;
        const comments = await Directory.findOne({_id})
        .populate('comments');
        res.status(StatusCodes.OK).json(comments.comments);
    } catch (error) {
        throw error;
    }  
});
