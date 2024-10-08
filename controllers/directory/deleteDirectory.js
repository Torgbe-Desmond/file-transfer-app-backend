const { deleteDirectoryTree } = require('../../utils/directory/deleteDirectoryRecursive');
const getDirectoryTree = require('../../utils/directory/getDirectoryTree');
const {
    expressAsyncHandler,
    StatusCodes,
    mongoose,
} = require('./configurations');

module.exports.deleteDirectory = expressAsyncHandler(async (req, res) => {
    // Extract directory IDs from the request body and user ID from the request
    const { directoryId } = req.body;

    // Start a MongoDB session for transaction management
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const directoryTreeObject =  await getDirectoryTree(directoryId,session)
        if(directoryTreeObject){
           await deleteDirectoryTree(directoryTreeObject,session)
        }

        // Commit the transaction after successful deletions
        await session.commitTransaction();

        // Return a response with the IDs of the deleted directories
        res.status(StatusCodes.OK).json({ message:'deletion was successful' });
    } catch (error) {
        // Abort the transaction if any error occurs
        await session.abortTransaction();
        throw error;
    } finally {
        // Ensure the session is ended regardless of success or failure
        session.endSession();
    }
});
