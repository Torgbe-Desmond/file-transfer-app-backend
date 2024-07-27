const { expressAsyncHandler, Directory, StatusCodes, mongoose, Comment } = require('../controller.comment/configurations');

module.exports.createNewComment = expressAsyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const user_Id = req.user;

    try {
        const { _id, comment } = req.body;
        const directoryExist = await Directory.findOne({ _id });

        const newComment = await Comment.create([{ user_Id, comment }], { session });

        if (newComment.length > 0 && directoryExist) {
            directoryExist.comments.push(newComment[0]._id);
        }

        await directoryExist.save({ session });
        await session.commitTransaction();
        res.status(StatusCodes.OK).json({ message: 'Message created successfully' });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
