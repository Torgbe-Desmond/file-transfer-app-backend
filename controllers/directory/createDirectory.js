const {
    expressAsyncHandler,
    Directory,
    BadRequest,
    NotFound,
    StatusCodes,
    mongoose,
} = require('./configurations');

module.exports.createDirectory = expressAsyncHandler(async (req, res) => {

    const { 
        user: user_id, 
        body: { name }, 
        params: { directoryId: parentDirectory } 
    } = req;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const directoryExist = await Directory.findOne({ _id: parentDirectory }).session(session);
        if (!directoryExist) {
            throw new NotFound('Parent directory does not exist');
        }

        const existingDirectory = await Directory.findOne({ parentDirectory, name }).session(session);
        if (existingDirectory) {
            throw new BadRequest('A directory with the specified name already exists');
        }

        let newDirectory;

        const createdDirectory = await Directory.create([{ name, user_id, parentDirectory }], { session });
            
        directoryExist.subDirectories.push(createdDirectory[0]._id);

        await directoryExist.save({ session })  

        newDirectory = createdDirectory[0]; 

        await session.commitTransaction();

        const formattedDirectory = {
            _id: newDirectory._id,
            name: newDirectory.name,
            parentDirectory: newDirectory.parentDirectory,
            user_id: newDirectory.user_id,
            mimetype: newDirectory.mimetype,
            size: newDirectory.size,
            lastUpdated:newDirectory.lastUpdated,
        };

        res.status(StatusCodes.CREATED).json(formattedDirectory);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
