const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
} = require('./configurations');

module.exports.createDirectory = expressAsyncHandler(async (req, res) => {
    // Destructure the necessary fields from the request object
    const { 
        user: user_id, // Extract the user ID from the request (assumed to be populated from auth middleware)
        body: { name, mimetype }, // Extract directory name, mimetype, and optional excelFile from the body
        params: { directoryId: parentDirectory } // Extract parent directory ID from URL parameters
    } = req;

    // Start a MongoDB session for transaction management
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if the parent directory exists
        const directoryExist = await Directory.findOne({ _id: parentDirectory }).session(session);
        if (!directoryExist) {
            throw new NotFound('Parent directory does not exist');
        }

        // Check if a directory with the same name already exists under the parent directory
        const existingDirectory = await Directory.findOne({ parentDirectory, name }).session(session);
        if (existingDirectory) {
            throw new BadRequest('A directory with the specified name already exists');
        }

        let newDirectory;

        // Check if creating a subscription-type directory
        if (directoryExist.name === 'Subscriptions' || directoryExist.mimetype === 'Subscription') {
            // Create a new subscription directory
            const newSubscription = await Directory.create([{ name, user_id, parentDirectory, mimetype }], { session });
            
            // Add the new subscription directory to the parent directory
            directoryExist.subDirectories.push(newSubscription[0]._id);
            await directoryExist.save({ session });

            newDirectory = newSubscription[0]; // Assign to return later
        } else {
            // Otherwise, create a standard directory
            const createdDirectory = await Directory.create([{ name, user_id, parentDirectory }], { session });
            
            // Add the new directory to the parent directory's subDirectories
            directoryExist.subDirectories.push(createdDirectory[0]._id);
            await directoryExist.save({ session });

            newDirectory = createdDirectory[0]; // Assign to return later
        }

        // Commit the transaction
        await session.commitTransaction();

        // Format the response with necessary fields
        const formattedDirectory = {
            _id: newDirectory._id,
            name: newDirectory.name,
            parentDirectory: newDirectory.parentDirectory,
            user_id: newDirectory.user_id,
            mimetype: newDirectory.mimetype,
            size: newDirectory.size,
        };

        // Send response
        res.status(StatusCodes.CREATED).json(formattedDirectory);
    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        throw error;
    } finally {
        // Always end the session
        session.endSession();
    }
});
