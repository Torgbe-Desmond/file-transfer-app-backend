const {
  expressAsyncHandler,
  Directory,
  BadRequest,
  NotFound,
  StatusCodes,
  mongoose,
} = require('./configurations');

module.exports.renameDirectory = expressAsyncHandler(async (req, res) => {
  const { _id, name } = req.body;

  // Input validation
  if (!_id || !name) {
      throw new BadRequest('Directory ID and new name must be provided.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
      // Check if the directory exists
      const directoryExist = await Directory.findById(_id).session(session);
      if (!directoryExist) {
          throw new NotFound('No such directory found.');
      }

      // Check if the name already exists in another directory
      const nameExist = await Directory.findOne({ name }).session(session);
      if (nameExist && nameExist._id.toString() !== _id) {
          throw new BadRequest('Name already exists.');
      }

      // Update the directory name
      const updatedDirectory = await Directory.findByIdAndUpdate(
          _id,
          { name },
          { new: true, session }
      );

      if (!updatedDirectory) {
          throw new Error('Failed to update directory name.');
      }

      // Prepare response object
      const { _id: updatedId, name: updatedName } = updatedDirectory;
      const newUpdatedDirectory = { _id: updatedId, name: updatedName };

      // Commit the transaction
      await session.commitTransaction();
      res.status(StatusCodes.OK).json(newUpdatedDirectory); // Use OK instead of CREATED for updates

  } catch (error) {
      await session.abortTransaction();
      throw error;
  } finally {
      session.endSession();
  }
});
