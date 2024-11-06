const { expressAsyncHandler, Directory, StatusCodes, mongoose, Comment } = require('../comment/configurations');

module.exports.createNewComment = expressAsyncHandler(async (req, res) => {
    // Start a new session and transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    // Get the user ID from the authenticated user
    const user_Id = req.user;

    try {
        // Destructure the directory ID and comment from the request body
        const { _id, comment } = req.body;
        
        // Check if the directory exists using the provided directory ID (_id)
        const directoryExist = await Directory.findOne({ _id });
        
        // Create the new comment associated with the user in a transaction
        const newComment = await Comment.create([{ user_Id, comment }], { session });

        // If the new comment was successfully created and the directory exists
        if (newComment.length > 0 && directoryExist) {
            // Push the new comment's ID into the directory's comments array
            directoryExist.comments.push(newComment[0]._id);
        }

        // Save the directory with the updated comments array within the same session
        await directoryExist.save({ session });

        // Commit the transaction after all operations have been successful
        await session.commitTransaction();
        
        // Respond with a success message
        res.status(StatusCodes.OK).json({ message: 'Comment created successfully' });

    } catch (error) {
        // Abort the transaction if there's an error
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session to free up resources
        session.endSession();
    }
});
