const {
    expressAsyncHandler,
    Directory,
    StatusCodes,
    mongoose,
    Comment
} = require('./configurations');


module.exports.createComment = expressAsyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const user_Id = req.user;
    
    try {
        const {_id, comment } = req.body
        const directoryExist = await Directory.findOne({_id});

        const newComment = await Comment.create([{user_Id,comment}],{session})

        if(newComment.length > 0  && directoryExist){
            directoryExist.comments.push(newComment[0]._id)
        }

        await directoryExist.save({session});

        await session.commitTransaction()
        res.status(StatusCodes.OK).json(editedSpecificDirectoryExist);
        
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
